import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { originalPhotoUrl, frameUrl, position = { x: 50, y: 50 }, scale = 0.8 } = await req.json()

    // For now, return the original photo until we implement full compositing
    // This prevents the CORS issue and allows the flow to continue
    const response = await fetch(originalPhotoUrl)
    const imageBuffer = await response.arrayBuffer()
    
    // Convert to base64 for returning
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    
    return new Response(
      JSON.stringify({ 
        success: true,
        compositeImage: `data:image/jpeg;base64,${base64}`,
        message: "Using original photo as composite (server-side compositing in development)"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in composite-image function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to composite image', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})