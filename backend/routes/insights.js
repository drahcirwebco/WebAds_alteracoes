import express from 'express';
import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

const router = express.Router();

// Get AI Insights from output table filtered by campaign
router.get('/:campaignName', async (req, res) => {
  try {
    const { campaignName } = req.params;
    const decodedCampaignName = decodeURIComponent(campaignName);
    
    const client = supabaseAdmin || supabase;
    
    // Buscar todos os insights da tabela output
    const { data, error } = await client
      .from('output')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insights from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch insights', details: error.message });
    }

    // Filtrar por campanha (procurar o nome da campanha no texto do output)
    const campaignInsights = (data || []).filter((row) => {
      const output = row.output || '';
      return output.includes(decodedCampaignName);
    });

    // Se não encontrar a campanha específica, retornar o mais recente
    const insight = campaignInsights.length > 0 
      ? campaignInsights[0] 
      : (data && data.length > 0 ? data[0] : null);

    if (!insight) {
      return res.json({
        success: true,
        insight: null,
        message: 'No insights found for this campaign'
      });
    }

    res.json({
      success: true,
      insight: {
        id: insight.id,
        content: insight.output,
        createdAt: insight.created_at,
        campaignName: decodedCampaignName
      }
    });
  } catch (error) {
    console.error('Error in /insights/:campaignName:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all insights (para análise global)
router.get('/', async (req, res) => {
  try {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('output')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights', details: error.message });
    }

    const insights = (data || []).map((row) => ({
      id: row.id,
      content: row.output,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      insights,
      total: insights.length
    });
  } catch (error) {
    console.error('Error in /insights:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
