import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, description, price, image_url } = await req.json()

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }

    // Criar produto no Stripe
    const productResponse = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        name: name,
        description: description || '',
        images: image_url ? [image_url] : [],
      }),
    })

    if (!productResponse.ok) {
      const error = await productResponse.text()
      throw new Error(`Erro ao criar produto no Stripe: ${error}`)
    }

    const product = await productResponse.json()

    // Criar preço para o produto
    const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product: product.id,
        unit_amount: Math.round(price * 100).toString(), // Converter para centavos
        currency: 'brl',
      }),
    })

    if (!priceResponse.ok) {
      const error = await priceResponse.text()
      throw new Error(`Erro ao criar preço no Stripe: ${error}`)
    }

    const priceData = await priceResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        product_id: product.id,
        price_id: priceData.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})