import Image from "next/image";

interface BlvckDlphnLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function BlvckDlphnLogo({
  width = 40,
  height = 40,
  className = "",
}: BlvckDlphnLogoProps) {
  return (
    <Image
      src="/New Logo.png"
      alt="BLVCK DLPHN Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
