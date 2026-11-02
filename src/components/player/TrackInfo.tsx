interface TrackInfoProps {
  title: string;
  artist: string;
}

export default function TrackInfo({ title, artist }: TrackInfoProps) {
  return (
    <div className="text-center select-none">
      <h2 className="text-lg font-handwriting text-[#f2eee9] tracking-wide truncate">
        {title}
      </h2>
      <p className="text-sm text-white/50 truncate">{artist}</p>
    </div>
  );
}
