import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { bidSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(){
  const { data, error } = await supabaseAdmin.from('bids').select('id,product_name,url,amount,category,expires_at,created_at').eq('status','active').gt('expires_at',new Date().toISOString()).order('amount',{ascending:false}).order('created_at',{ascending:true});
  if(error) return NextResponse.json({error:'Could not load leaderboard.'},{status:500});
  return NextResponse.json({bids:data||[]},{headers:{'Cache-Control':'no-store'}});
}

export async function POST(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  if(!(await rateLimit(`bid:${ip}`,8,60_000))) return NextResponse.json({error:'Too many requests. Try again shortly.'},{status:429});
  try{
    const parsed=bidSchema.parse(await req.json());
    const {data:bid,error:bidError}=await supabaseAdmin.from('bids').insert({product_name:parsed.productName,url:parsed.url,amount:parsed.amount,category:parsed.category,status:'pending',expires_at:new Date(Date.now()+24*60*60*1000).toISOString()}).select('id').single();
    if(bidError||!bid) return NextResponse.json({error:'Could not create bid.'},{status:500});
    const {error:txError}=await supabaseAdmin.from('transactions').insert({bid_id:bid.id,amount:parsed.amount,status:'pending'});
    if(txError) return NextResponse.json({error:'Could not initialize payment.'},{status:500});
    const session=await stripe.checkout.sessions.create({mode:'payment',invoice_creation:{enabled:true},line_items:[{price_data:{currency:'usd',product_data:{name:`Lyrosc rank: ${parsed.productName}`},unit_amount:Math.round(parsed.amount*100)},quantity:1}],success_url:`${env.NEXT_PUBLIC_SITE_URL}/success?bid=${bid.id}`,cancel_url:`${env.NEXT_PUBLIC_SITE_URL}/?cancelled=1#bid`,metadata:{bid_id:String(bid.id)},payment_intent_data:{metadata:{bid_id:String(bid.id)}}});
    return NextResponse.json({checkoutUrl:session.url});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid request.'},{status:400});}
}
