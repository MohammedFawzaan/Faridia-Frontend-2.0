const HOSPITAL_TIME_ZONE = 'Asia/Kolkata'

export const dateKey = (value: Date | string) =>
  new Date(value).toLocaleDateString('en-CA', { timeZone: HOSPITAL_TIME_ZONE })

export const todayKey = () => dateKey(new Date())

export const isToday = (value: string) => dateKey(value) === todayKey()

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: HOSPITAL_TIME_ZONE,
  })

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: HOSPITAL_TIME_ZONE,
  })

export const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: HOSPITAL_TIME_ZONE })
