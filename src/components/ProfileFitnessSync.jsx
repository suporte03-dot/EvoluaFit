import { useEffect, useRef } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useProfile } from '../context/ProfileContext'
import {
  cloudGoalToCode,
  codeToCloudGoal,
  resolveDaysPerWeek,
} from '../utils/profileIdentity'

/**
 * Keeps the account profile (Supabase) and the local training profile
 * (planilha / Coach / home) on the same objective, level and weekly frequency.
 */
export default function ProfileFitnessSync() {
  const { profile: cloud, loadingProfile, updateProfile: updateCloud } = useProfile()
  const { profile, generatedPlan, updateProfile } = useFitness()
  const lastLocalRef = useRef('')
  const lastCloudRef = useRef('')

  useEffect(() => {
    if (loadingProfile) return

    const planObjective = generatedPlan?.objective || ''
    const planLevel = generatedPlan?.level || ''
    const days = resolveDaysPerWeek({ profile, generatedPlan })
    const cloudCode = cloudGoalToCode(cloud?.goal)
    const nextObjective = cloudCode || planObjective || profile?.objective || ''
    const nextLevel = cloud?.level || planLevel || profile?.level || ''
    const nextName = (cloud?.full_name || profile?.name || '').trim()

    const localPatch = {}
    if (nextName && nextName !== profile?.name) localPatch.name = nextName
    if (nextObjective && nextObjective !== profile?.objective) localPatch.objective = nextObjective
    if (nextLevel && nextLevel !== profile?.level) localPatch.level = nextLevel
    if (days > 0 && days !== Number(profile?.daysPerWeek || 0)) localPatch.daysPerWeek = days
    if (generatedPlan?.duration && generatedPlan.duration !== profile?.duration) {
      localPatch.duration = generatedPlan.duration
    } else if (generatedPlan?.minutesPerWorkout && generatedPlan.minutesPerWorkout !== profile?.duration) {
      localPatch.duration = generatedPlan.minutesPerWorkout
    }

    const localKey = JSON.stringify(localPatch)
    if (Object.keys(localPatch).length && localKey !== lastLocalRef.current) {
      lastLocalRef.current = localKey
      updateProfile(localPatch, { silent: true })
    }

    if (!cloud) return

    const cloudPatch = {}
    const mappedGoal = codeToCloudGoal(nextObjective)
    if (!cloud.goal && mappedGoal) cloudPatch.goal = mappedGoal
    if (!cloud.level && nextLevel) cloudPatch.level = nextLevel

    const cloudKey = JSON.stringify(cloudPatch)
    if (Object.keys(cloudPatch).length && cloudKey !== lastCloudRef.current) {
      lastCloudRef.current = cloudKey
      updateCloud(cloudPatch)
    }
  }, [cloud, loadingProfile, generatedPlan, profile, updateProfile, updateCloud])

  return null
}
