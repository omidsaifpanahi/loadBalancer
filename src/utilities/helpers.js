
function selectServer(servers, strategy) {
  if (!servers || servers.length === 0) {
    return null;
  }

  strategyStats[strategy]++;

  switch (strategy) {
    case 'leastPeers':
      return servers.reduce((min, server) =>
          server.totalPeers < min.totalPeers ? server : min
      );

    case 'leastRooms':
      return servers.reduce((min, server) =>
          server.roomCount < min.roomCount ? server : min
      );

    case 'random':
      return servers[Math.floor(Math.random() * servers.length)];

    case 'roundRobin':
      const server = servers[roundRobinIndex % servers.length];
      roundRobinIndex++;
      return server;

    default:
      return servers[0];
  }
}


module.exports = {
  selectServer
};