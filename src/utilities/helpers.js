// file_path : utilities/helpers.js
const stateManagement = require('../stateManagement');

function selectServer(servers, strategy) {
  if (!servers || servers.length === 0) {
    return null;
  }

  stateManagement.strategyStats[strategy]++;

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
      const server = servers[stateManagement.roundRobinIndex % servers.length];
      stateManagement.roundRobinIndex++;
      return server;

    case 'fillToCapacity':
      const MAX_PEERS_PER_SERVER = 200; // مثلاً ظرفیت هر سرور
      // ابتدا سرورهایی که هنوز جا دارند:
      const notFull = servers.filter(s => s.totalPeers < MAX_PEERS_PER_SERVER);

      if (notFull.length > 0) {
        // سروری که بیشترین کاربر دارد ولی هنوز جا دارد
        return notFull.reduce((max, s) =>
            s.totalPeers > max.totalPeers ? s : max
        );
      } else {
        // اگر همه پر بودند، کم‌کارترین را انتخاب کن
        return servers.reduce((min, s) =>
            s.totalPeers < min.totalPeers ? s : min
        );
      }

    default:
      return servers[0];
  }
}


module.exports = {
  selectServer
};