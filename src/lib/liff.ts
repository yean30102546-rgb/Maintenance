// LINE LIFF placeholder for client-side usage
export async function initLiff() {
  if (typeof window !== 'undefined') {
    // Dynamically import LIFF to avoid SSR issues
    const liff = (await import('@line/liff')).default
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
      return liff
    } catch (err) {
      console.error('LIFF init failed', err)
      throw err
    }
  }
  return null
}
