export const PLATFORM_LINKS = {
  MMT: 'https://www.makemytrip.com/flights',
  Ixigo: 'https://www.ixigo.com/flights',
  Cleartrip: 'https://www.cleartrip.com/flights',
  Goibibo: 'https://www.goibibo.com/flights',
  EaseMyTrip: 'https://www.easemytrip.com',
  Yatra: 'https://www.yatra.com/flights',
  Paytm: 'https://travel.paytm.com/flights',
};

export const getPlatformLink = p => PLATFORM_LINKS[p] || '#';
