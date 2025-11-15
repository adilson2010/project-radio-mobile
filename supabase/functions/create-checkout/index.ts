import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Buscar produtos do Supabase
    const productIds = items.map((item: any) => item.id)
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds)

    if (error) {
      throw error
    }

    // Criar line items para o Stripe
    const lineItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.id)
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.id}`)
      }

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.name,
            description: product.description,
            images: [product.image_url],
          },
          unit_amount: Math.round(product.price * 100), // Converter para centavos
        },
        quantity: item.quantity,
      }
    })

    // Criar sessão do Stripe Checkout
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${req.headers.get('origin')}/loja?success=true`,
        'cancel_url': `${req.headers.get('origin')}/loja?canceled=true`,
        'line_items[0][price_data][currency]': lineItems[0].price_data.currency,
        'line_items[0][price_data][product_data][name]': lineItems[0].price_data.product_data.name,
        'line_items[0][price_data][unit_amount]': lineItems[0].price_data.unit_amount.toString(),
        'line_items[0][quantity]': lineItems[0].quantity.toString(),
        ...lineItems.slice(1).reduce((acc: any, item: any, index: number) => {
          const i = index + 1
          acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency
          acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name
          acc[`line_items[${i}][price_data][unit_amount]`] = item.price_data.unit_amount.toString()
          acc[`line_items[${i}][quantity]`] = item.quantity.toString()
          return acc
        }, {})
      }),
    })

    const session = await stripeResponse.json()

    if (!stripeResponse.ok) {
      throw new Error(session.error?.message || 'Erro ao criar sessão de checkout')
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})