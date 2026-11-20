import logoUrl from '@/assets/logo.svg'
import loginLogoUrl from '@/assets/login-logo.svg'

interface LogoProps {
  size?: 'sm' | 'lg'
}

export function Logo({ size = 'sm' }: LogoProps) {
  return size === 'lg' ? (
    <img src={loginLogoUrl} alt="Faridia Hospital" width={70} height={71} />
  ) : (
    <img src={logoUrl} alt="Faridia Hospital" width={34} height={34} />
  )
}
