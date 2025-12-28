const leaderboardData = [
  { id: 1, name: "User 1", points: 200, avatar: "https://i.pravatar.cc/100?img=1" },
  { id: 2, name: "User 2", points: 200, avatar: "https://i.pravatar.cc/100?img=2" },
  { id: 3, name: "User 3", points: 200, avatar: "https://i.pravatar.cc/100?img=3" },
  { id: 4, name: "User 4", points: 200, avatar: "https://i.pravatar.cc/100?img=4" },
  { id: 5, name: "User 5", points: 200, avatar: "https://i.pravatar.cc/100?img=5" },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-900 to-purple-900 p-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-5 text-white">

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

        {/* Top 3 */}
        <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-end mb-5">
          {/* 2nd */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold">
              2nd
            </div>
            <p className="text-xs mt-1">Name - Points</p>
          </div>

          {/* 1st */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-bold">
              1st
            </div>
            <p className="text-xs mt-1">Name - Points</p>
          </div>

          {/* 3rd */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold">
              3rd
            </div>
            <p className="text-xs mt-1">Name - Points</p>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-white/20 rounded-xl px-3 py-2 flex justify-between text-sm font-semibold mb-2">
          <span>Pos</span>
          <span>Name</span>
          <span>Points</span>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboardData.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                index === 2 ? "bg-white/20" : "bg-white/10"
              }`}
            >
              <span>{index + 1}</span>

              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">{user.name}</span>
              </div>

              <span className="text-sm">{user.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
