export default (floor, startTile, endTile) => {
  const tiles = floor.tiles;
  const fixed = {};
  const cost = {};
  const path = [];
  const routeMap = {};
  
  tiles.forEach((tile) => {
    cost[tile.id] = Infinity;
  });

  cost[endTile.id] = 0;
  routeMap[endTile.id] = null;
  
  while (true) {
    const minCostTile = tiles.reduce((acc, tile) => {
      if (fixed[tile.id]) return acc;
      if (!acc) return tile;
      if (cost[tile.id] < cost[acc.id]) return tile;
      return acc;
    }, null);
    
    if (!minCostTile) break;
    minCostTile.neighborhoods.forEach((tile) => {
      if (fixed[tile.id]) return;
      const c = cost[minCostTile.id] + 1;
      if (c < cost[tile.id]) {
        cost[tile.id] = c;
        routeMap[tile.id] = minCostTile.id;
      }
    });
    fixed[minCostTile.id] = true;
  }

  let cur = startTile.id;
  const routes = [];

  if (!(cur in routeMap)) return null;
  while (cur) {
    routes.push(floor.byId(cur));
    cur = routeMap[cur];
  }
  return routes;
}
