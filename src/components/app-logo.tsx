interface AppLogoProps {
  size?: number;
}

export default function AppLogo({ size = 64 }: AppLogoProps) {
  const aspectRatio = 56 / 64;
  const height = Math.round(size * aspectRatio);
  return <img src="/logo.jpg" alt="logo" width={size} height={height} />;
}
