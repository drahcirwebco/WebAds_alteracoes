import express from 'express';
import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

const router = express.Router();

// Get Meta Ads campaigns from Supabase facebook-ads table
router.get('/campaigns/meta-ads', async (req, res) => {
  try {
    console.log('[Meta Ads] Fetching campaigns...');
    // Usar admin client se disponível, senão usar public client
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('*');

    if (error) {
      console.error('[Meta Ads] Error fetching from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch Meta Ads campaigns', details: error.message });
    }

    console.log(`[Meta Ads] Found ${data?.length || 0} records`);
    
    // Consolidar dados por campanha (pegar apenas o último valor)
    const campaignMap = {};
    
    (data || []).forEach((row) => {
      const campaignName = row.Campanha || 'Unknown Campaign';
      
      if (!campaignMap[campaignName]) {
        campaignMap[campaignName] = row;
      } else {
        // Comparar datas para manter apenas o registro mais recente
        const existingDate = new Date(campaignMap[campaignName].Data_final || campaignMap[campaignName].Data_inicio);
        const currentDate = new Date(row.Data_final || row.Data_inicio);
        
        if (currentDate > existingDate) {
          campaignMap[campaignName] = row;
        }
      }
    });

    // Mapear dados para formato esperado
    const campaigns = Object.values(campaignMap).map((row) => ({
      id: `meta-${row.id}`,
      name: row.Campanha || 'Unknown Campaign',
      platform: 'Meta',
      status: 'active',
      startDate: row.Data_inicio,
      endDate: row.Data_final,
      metrics: {
        impressions: parseFloat(row.Impressoes) || 0,
        clicks: parseFloat(row.Cliques) || 0,
        spend: parseFloat(row['Valor investido']) || 0,
        leads: parseFloat(row.leads) || 0,
        costPerClick: (parseFloat(row.Cliques) || 0) > 0 
          ? parseFloat(((parseFloat(row['Valor investido']) || 0) / (parseFloat(row.Cliques) || 0)).toFixed(2))
          : 0,
        cpa: (parseFloat(row.leads) || 0) > 0 
          ? parseFloat(((parseFloat(row['Valor investido']) || 0) / (parseFloat(row.leads) || 0)).toFixed(2))
          : 0
      }
    }));

    res.json({
      success: true,
      campaigns,
      total: campaigns.length
    });
    console.log(`[Meta Ads] Returned ${campaigns.length} campaigns`);
  } catch (error) {
    console.error('[Meta Ads] Error in /campaigns/meta-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Meta Ads daily performance data (for charts)
router.get('/campaigns/meta-ads/daily', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('*')
      .order('Data_inicio', { ascending: true });

    if (error) {
      console.error('Error fetching daily data:', error);
      return res.status(500).json({ error: 'Failed to fetch daily data', details: error.message });
    }

    // Transform data to daily performance format
    // Group by date and return clicks/leads for each day
    const dailyData = {};
    
    (data || []).forEach((row) => {
      const date = row.Data_inicio; // Format: YYYY-MM-DD
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          clicks: 0,
          leads: 0,
          impressions: 0,
          spend: 0
        };
      }
      
      dailyData[date].clicks += parseFloat(row.Cliques) || 0;
      dailyData[date].leads += parseFloat(row.leads) || 0;
      dailyData[date].impressions += parseFloat(row.Impressoes) || 0;
      dailyData[date].spend += parseFloat(row['Valor investido']) || 0;
    });

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: dailyArray,
      total: dailyArray.length
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/daily:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Check if Meta Ads data is available
router.get('/campaigns/meta-ads/status', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { count, error } = await client
      .from('facebook-ads')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking Meta Ads status:', error);
      return res.json({ available: false, campaignCount: 0 });
    }

    res.json({
      available: true,
      campaignCount: count || 0
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/status:', error);
    res.json({ available: false, campaignCount: 0 });
  }
});

// Get available dates from Meta Ads
router.get('/dates/meta-ads', async (req, res) => {
  try {
    console.log('[Meta Ads] Fetching available dates from facebook-ads...');
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facebook-ads')
      .select('Data_inicio');

    if (error) {
      console.error('[Meta Ads] Error fetching dates:', error);
      return res.status(500).json({ error: 'Failed to fetch dates', details: error.message });
    }

    // Extrair datas únicas - manter em formato ISO (yyyy-MM-dd)
    const uniqueDates = [...new Set(
      (data || [])
        .map(row => {
          const dateStr = row.Data_inicio;
          if (!dateStr) return null;
          
          // Se já está em ISO, retorna direto
          if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr.split('T')[0]; // Remove hora se houver
          }
          return null;
        })
        .filter(date => date !== null)
    )].sort();

    console.log(`[Meta Ads] Found ${uniqueDates.length} unique dates`);

    res.json({
      success: true,
      dates: uniqueDates
    });
  } catch (error) {
    console.error('Error in /dates/meta-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Meta Ads campaign data for a specific date
router.get('/campaigns/meta-ads/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const client = supabaseAdmin || supabase;
    
    console.log(`[Meta Ads By Date] Fetching campaign data for date: ${date}`);
    
    // Tentar buscar com a coluna Data_inicio
    let result = await client
      .from('facebook-ads')
      .select('*')
      .eq('Data_inicio', date);

    let data = result.data;
    let error = result.error;
    
    // Se nenhum resultado, tentar com outras possíveis colunas de data
    if ((data?.length || 0) === 0 && !error) {
      console.log(`[Meta Ads By Date] No results with 'Data_inicio', trying other formats...`);
      
      // Tentar buscar todos e depois filtrar em memória
      const allResult = await client.from('facebook-ads').select('*');
      if (!allResult.error && allResult.data) {
        data = allResult.data.filter((row) => {
          const rowDate = row.Data_inicio || row.data_inicio || row.date || row.Date || '';
          return rowDate === date;
        });
        console.log(`[Meta Ads By Date] Found ${data?.length || 0} records after filtering in memory`);
        
        // Log das colunas disponíveis
        if (allResult.data.length > 0) {
          console.log('[Meta Ads By Date] Available columns:', Object.keys(allResult.data[0]));
        }
      }
    } else if (error) {
      console.error('[Meta Ads By Date] Error fetching date data:', error);
      return res.status(500).json({ error: 'Failed to fetch data for date', details: error.message });
    }

    console.log(`[Meta Ads By Date] Total records found: ${data?.length || 0}`);

    // Transformar em formato de campanha
    const campaigns = (data || []).map((row) => {
      const campaignName = row.Nome_da_Campanha || row.nome_da_campanha || row.name || 'Unknown';
      const spent = parseFloat(row.Gasto || row.gasto || row.investimento || 0) || 0;
      const clicks = parseFloat(row.Cliques || row.cliques || 0) || 0;
      const leads = parseFloat(row.Leads || row.leads || 0) || 0;
      
      return {
        id: `meta-${date}-${campaignName.replace(/\s+/g, '-')}`,
        name: campaignName,
        spent: spent,
        impressions: parseFloat(row.Impressoes || row.impressoes || 0) || 0,
        clicks: clicks,
        conversions: parseFloat(row.Conversoes || row.conversoes || 0) || 0,
        leads: leads,
        cpc: clicks > 0 ? spent / clicks : 0,
        cpa: leads > 0 ? spent / leads : 0,
        platform: 'Meta Ads',
        date: date
      };
    });

    console.log(`[Meta Ads By Date] Returning ${campaigns.length} campaigns`);

    res.json({
      success: true,
      date: date,
      campaigns: campaigns
    });
  } catch (error) {
    console.error('Error in /campaigns/meta-ads/by-date:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
