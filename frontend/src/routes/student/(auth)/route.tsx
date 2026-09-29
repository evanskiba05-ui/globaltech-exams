import { Outlet, createFileRoute } from '@tanstack/react-router'
import { motion } from "motion/react"

export const Route = createFileRoute('/student/(auth)')({
  component: PathlessLayoutComponent,
})

function PathlessLayoutComponent() {
  return (
    <div className='h-full '>
      <Outlet />
    </div>
  )
}