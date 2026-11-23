import { useState } from 'react'
import femaleAvatar from '@/assets/avatars/female.svg'
import maleAvatar from '@/assets/avatars/male.svg'
import otherAvatar from '@/assets/avatars/other.svg'
import type { Patient } from '@/types/patient'

const SIZE_CLASS = { sm: 'size-9', md: 'size-12', lg: 'size-24' }
const GENDER_AVATAR = { male: maleAvatar, female: femaleAvatar, other: otherAvatar }
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL ?? ''

interface PatientAvatarProps {
  patient: Pick<Patient, 'name' | 'gender' | 'photoPath'>
  size?: keyof typeof SIZE_CLASS
  className?: string
}

export function PatientAvatar({ patient, size = 'md', className = '' }: PatientAvatarProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const photo = patient.photoPath && !photoFailed ? `${UPLOADS_URL}${patient.photoPath}` : null

  return (
    <span className={`avatar shrink-0 ${className}`}>
      <span className={`${SIZE_CLASS[size]} rounded-full bg-primary/10 ring-2 ring-primary/30`}>
        <img
          src={photo ?? GENDER_AVATAR[patient.gender]}
          alt={`${patient.name}`}
          className="object-cover"
          onError={() => setPhotoFailed(true)}
        />
      </span>
    </span>
  )
}
