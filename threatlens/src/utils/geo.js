export const getLocationFromIP = async (ip) => {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();

    return { lat: data.lat, lon: data.lon };
  } catch {
    return null;
  }
};

export const latLongToVector3 = (lat, lon, radius = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
};