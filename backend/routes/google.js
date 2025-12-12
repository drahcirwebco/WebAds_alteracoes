import express from 'express';
import { supabaseGoogle } from '../services/supabaseClient.js';

const router = express.Router();

// Get Google Ads campaigns from Supabase Gallant_dadosDiarios table
router.get('/campaigns/google-ads', async (req, res) => {
  try {
    // Usar client do Google Ads (Gallant)
    const client = supabaseGoogle;
    
    console.log('[Google Ads] Fetching campaigns from Gallant_dadosDiarios...');
    
    const { data, error } = await client
      .from('Gallant_dadosDiarios')
      .select('*');

    if (error) {
      console.error('[Google Ads] Error fetching from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch Google Ads campaigns', details: error.message });
    }

    console.log(`[Google Ads] Found ${data?.length || 0} records`);

    // Consolidar dados por campanha (pegar apenas o último valor)
    const campaignMap = {};
    
    (data || []).forEach((row) => {
      // Tentar diferentes nomes de coluna
      const campaignName = row.campanha || row.Campanha || row.campaign || row.Campaign || 'Unknown Campaign';
      
      if (!campaignMap[campaignName]) {
        campaignMap[campaignName] = row;
      } else {
        // Comparar datas para manter apenas o registro mais recente
        const existingDate = new Date(
          campaignMap[campaignName].data_final || 
          campaignMap[campaignName].data_inicio || 
          campaignMap[campaignName].Data_final || 
          campaignMap[campaignName].Data_inicio ||
          campaignMap[campaignName].date ||
          '1970-01-01'
        );
        const currentDate = new Date(
          row.data_final || 
          row.data_inicio || 
          row.Data_final || 
          row.Data_inicio ||
          row.date ||
          '1970-01-01'
        );
        
        if (currentDate > existingDate) {
          campaignMap[campaignName] = row;
        }
      }
    });

    // Mapear dados para formato esperado
    const campaigns = Object.values(campaignMap).map((row) => {
      // Flexibilidade com nomes de colunas
      const getFieldValue = (names) => {
        for (const name of names) {
          if (row[name] !== undefined && row[name] !== null) {
            return row[name];
          }
        }
        return 0;
      };

      return {
        id: `google-${row.id || Math.random()}`,
        name: row.campanha || row.Campanha || row.campaign || row.Campaign || 'Unknown Campaign',
        platform: 'Google Ads',
        status: 'active',
        startDate: row.data || row.data_inicio || row.Data_inicio || row.date,
        endDate: row.data || row.data_final || row.Data_final,
        metrics: {
          impressions: parseFloat(getFieldValue(['impressoes', 'Impressoes', 'impressions', 'Impressions'])) || 0,
          clicks: parseFloat(getFieldValue(['cliques', 'Cliques', 'clicks', 'Clicks'])) || 0,
          spend: parseFloat(getFieldValue(['custo', 'Custo', 'gasto', 'Gasto', 'valor_investido', 'Valor_investido', 'spend', 'valor'])) || 0,
          leads: parseFloat(getFieldValue(['conversoes', 'Conversoes', 'leads', 'Leads'])) || 0,
          conversions: parseFloat(getFieldValue(['conversoes', 'Conversoes', 'conversions', 'Conversions'])) || 0,
          costPerClick: 0,
          cpa: 0
        }
      };
    }).map((campaign) => ({
      ...campaign,
      metrics: {
        ...campaign.metrics,
        costPerClick: campaign.metrics.clicks > 0 
          ? parseFloat((campaign.metrics.spend / campaign.metrics.clicks).toFixed(2))
          : 0,
        cpa: campaign.metrics.leads > 0 
          ? parseFloat((campaign.metrics.spend / campaign.metrics.leads).toFixed(2))
          : 0
      }
    }));

    res.json({
      success: true,
      campaigns,
      total: campaigns.length
    });
  } catch (error) {
    console.error('Error in /campaigns/google-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Google Ads daily performance data (for charts)
router.get('/campaigns/google-ads/daily', async (req, res) => {
  try {
    const client = supabaseGoogle;
    
    console.log('Tentando buscar dados diários de Gallant_dadosDiarios...');
    
    const { data, error } = await client
      .from('Gallant_dadosDiarios')
      .select('*');

    if (error) {
      console.error('Error fetching daily data:', error);
      return res.status(500).json({ error: 'Failed to fetch daily data', details: error.message });
    }

    console.log(`Encontrados ${data?.length || 0} registros diários`);
    
    // Log para debug: mostrar colunas do primeiro registro
    if (data && data.length > 0) {
      console.log('[Google Ads Daily] Sample record columns:', Object.keys(data[0]));
      console.log('[Google Ads Daily] First record:', data[0]);
    }

    // Transform data to daily performance format
    const dailyData = {};
    
    (data || []).forEach((row) => {
      // A coluna de data é 'data'
      const date = row.data || 'unknown';
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          clicks: 0,
          leads: 0,
          impressions: 0,
          spend: 0,
          conversions: 0
        };
      }
      
      // Flexibilidade com nomes de colunas
      dailyData[date].clicks += parseFloat(row.cliques || row.Cliques || row.clicks || 0) || 0;
      dailyData[date].leads += parseFloat(row.conversoes || row.Conversoes || row.leads || row.Leads || 0) || 0;
      dailyData[date].impressions += parseFloat(row.impressoes || row.Impressoes || row.impressions || 0) || 0;
      dailyData[date].spend += parseFloat(row.custo || row.Custo || row.gasto || row.Gasto || row.valor_investido || row.Valor_investido || row.spend || 0) || 0;
      dailyData[date].conversions += parseFloat(row.conversoes || row.Conversoes || row.conversions || row.leads || 0) || 0;
    });

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    ).map(item => ({
      date: item.date,
      clicks: parseFloat(item.clicks) || 0,
      leads: parseFloat(item.leads) || 0,
      impressions: parseFloat(item.impressions) || 0,
      spend: parseFloat(item.spend) || 0,
      conversions: parseFloat(item.conversions) || 0
    }));

    console.log('[Google Ads Daily] Final daily array sample:', dailyArray.slice(0, 2));
    console.log('[Google Ads Daily] Total records:', dailyArray.length);

    res.json({
      success: true,
      data: dailyArray,
      total: dailyArray.length
    });
  } catch (error) {
    console.error('Error in /campaigns/google-ads/daily:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get Google Ads insights
router.get('/insights/google-ads', async (req, res) => {
  try {
    const client = supabaseGoogle;
    
    console.log('Tentando buscar insights de Gallant_insights...');
    
    const { data, error } = await client
      .from('Gallant_insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights', details: error.message });
    }

    console.log(`Encontrados ${data?.length || 0} insights`);

    // Transform insights data
    const insights = (data || []).map((row) => ({
      id: row.id,
      content: row.output || row.conteudo || row.insight || row.content || '',
      createdAt: row.created_at || row.data_criacao || row.date,
      campaign: row.campanha || row.Campanha || row.campaign || row.Campaign
    }));

    res.json({
      success: true,
      insights,
      total: insights.length
    });
  } catch (error) {
    console.error('Error in /insights/google-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get insights by campaign
router.get('/insights/google-ads/:campaignName', async (req, res) => {
  try {
    const { campaignName } = req.params;
    const client = supabaseGoogle;
    
    console.log(`Tentando buscar insights para campanha: ${campaignName}`);
    
    const { data, error } = await client
      .from('Gallant_insights')
      .select('*')
      .ilike('campanha', `%${campaignName}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching campaign insights:', error);
      return res.status(500).json({ error: 'Failed to fetch campaign insights', details: error.message });
    }

    const insight = (data && data.length > 0) ? {
      id: data[0].id,
      content: data[0].output || data[0].conteudo || data[0].insight || data[0].content || '',
      createdAt: data[0].created_at || data[0].data_criacao || data[0].date,
      campaign: data[0].campanha || data[0].Campanha || data[0].campaign || data[0].Campaign
    } : null;

    res.json({
      success: true,
      insight
    });
  } catch (error) {
    console.error('Error in /insights/google-ads/:campaignName:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get available dates from Google Ads
router.get('/dates/google-ads', async (req, res) => {
  try {
    const client = supabaseGoogle;
    
    console.log('[Google Ads] Fetching available dates from Gallant_dadosDiarios...');
    
    const { data, error } = await client
      .from('Gallant_dadosDiarios')
      .select('data');

    if (error) {
      console.error('[Google Ads] Error fetching dates:', error);
      return res.status(500).json({ error: 'Failed to fetch dates', details: error.message });
    }

    // Extrair datas únicas - manter em formato ISO (yyyy-MM-dd)
    const uniqueDates = [...new Set(
      (data || [])
        .map(row => {
          const dateStr = row.data;
          if (!dateStr) return null;
          
          // Se já está em ISO, retorna direto
          if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr.split('T')[0]; // Remove hora se houver
          }
          return null;
        })
        .filter(date => date !== null)
    )].sort();

    console.log(`[Google Ads] Found ${uniqueDates.length} unique dates`);

    res.json({
      success: true,
      dates: uniqueDates
    });
  } catch (error) {
    console.error('Error in /dates/google-ads:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
