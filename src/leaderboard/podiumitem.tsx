type PodiumItemProps = {
  rank: number
  name: string
  score: number
}

export default function PodiumItem({
  rank,
  name,
  score,
}: PodiumItemProps) {
  return (
    <div className={`podium-item rank-${rank}`}>
      <div className="rank">{rank}</div>
      <div className="name">{name}</div>
      <div className="score">{score} pts</div>
    </div>
  )
}
