export const calculateQibla = (lat: number, lng: number): number => {
  const PI = Math.PI;
  // Koordinat Ka'bah
  const latK = 21.422487 * (PI / 180.0);
  const lngK = 39.826206 * (PI / 180.0);
  
  const phi = lat * (PI / 180.0);
  const lambda = lng * (PI / 180.0);
  
  const y = Math.sin(lngK - lambda);
  const x = Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(lngK - lambda);
  
  let qibla = Math.atan2(y, x) * (180.0 / PI);
  
  // Pastikan hasil positif antara 0 - 360
  return (qibla + 360.0) % 360.0;
};
