'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Camera, ArrowLeft, Save, Globe, Shield, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface SettingsClientProps {
	user: any
}

export default function SettingsClient({ user }: SettingsClientProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: user.name || '',
		bio: user.bio || '',
		dob: user.dob || '',
		image: user.image || '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isLoading) return

		setIsLoading(true)
		try {
			const res = await fetch(`/api/user/username/${user.username}/profile`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			const data = await res.json()
			if (res.ok && data.updated) {
				router.push(`/profile/${user.username}`)
				router.refresh()
			} else {
				alert(data.error || 'Failed to update profile')
			}
		} catch (error) {
			console.error('Error updating profile:', error)
			alert('Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='mx-auto max-w-4xl space-y-8 px-4 py-12'>
			<div className='flex items-center gap-4'>
				<Link
					href={`/profile/${user.username}`}
					className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-main transition-colors hover:bg-secondary'
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<h1 className='text-2xl font-extrabold tracking-tight text-main sm:text-3xl'>
						Edit Profile
					</h1>
					<p className='text-sm text-subtle'>
						Manage your public presence and personal details.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='grid grid-cols-1 gap-8 md:grid-cols-3'>
				<div className='space-y-6 md:col-span-1'>
					<Card className='space-y-6 p-6 text-center'>
						<div className='relative mx-auto h-32 w-32'>
							<div className='group relative h-full w-full overflow-hidden rounded-full border-4 border-primary/20 bg-secondary'>
								{formData.image ? (
									<Image
										src={formData.image}
										alt={formData.name}
										fill
										className='object-cover'
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center text-muted'>
										<User size={48} />
									</div>
								)}
								<div className='absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
									<Camera size={24} className='text-white' />
								</div>
							</div>
						</div>
						<div className='space-y-1'>
							<h3 className='font-bold text-main'>{user.name}</h3>
							<p className='text-sm text-subtle'>@{user.username}</p>
						</div>
						<div className='pt-2'>
							<input
								type='url'
								placeholder='Profile Image URL'
								className='w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-main focus:ring-1 focus:ring-primary focus:outline-none'
								value={formData.image}
								onChange={(e) =>
									setFormData({ ...formData, image: e.target.value })
								}
							/>
						</div>
					</Card>

					<div className='space-y-4 rounded-2xl border border-border/50 bg-secondary/20 p-6'>
						<h4 className='text-xs font-bold tracking-widest text-muted uppercase'>
							Privacy Note
						</h4>
						<div className='flex items-start gap-3'>
							<Globe size={16} className='mt-0.5 flex-shrink-0 text-main' />
							<p className='text-xs leading-relaxed text-subtle'>
								Your <strong>Name</strong> and <strong>Bio</strong> are visible to
								everyone on the platform.
							</p>
						</div>
						<div className='flex items-start gap-3'>
							<Lock size={16} className='mt-0.5 flex-shrink-0 text-main' />
							<p className='text-xs leading-relaxed text-subtle'>
								Your <strong>Date of Birth</strong> is only visible to you on your
								profile page.
							</p>
						</div>
					</div>
				</div>

				<div className='space-y-6 md:col-span-2'>
					<Card className='space-y-6 p-6 sm:p-8'>
						<div className='space-y-4'>
							<label className='block space-y-2'>
								<span className='text-sm font-bold text-main'>Display Name</span>
								<input
									required
									type='text'
									className='w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-main transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none'
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
								/>
							</label>

							<label className='block space-y-2'>
								<span className='text-sm font-bold text-main'>Bio</span>
								<textarea
									rows={5}
									placeholder='Tell your story...'
									className='w-full resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 text-main transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none'
									value={formData.bio || ''}
									onChange={(e) =>
										setFormData({ ...formData, bio: e.target.value })
									}
								/>
								<div className='text-right text-[10px] text-muted'>
									{(formData.bio || '').length}/160
								</div>
							</label>

							<label className='block space-y-2'>
								<span className='text-sm font-bold text-main'>Date of Birth</span>
								<input
									type='date'
									className='w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-main transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none'
									value={formData.dob || ''}
									onChange={(e) =>
										setFormData({ ...formData, dob: e.target.value })
									}
								/>
							</label>
						</div>

						<div className='flex justify-end gap-3 pt-6'>
							<Link href={`/profile/${user.username}`}>
								<Button className='border border-border bg-error px-6 text-main'>
									Cancel
								</Button>
							</Link>
							<Button
								type='submit'
								isLoading={isLoading}
								className='btn-brand px-10 shadow-lg'
							>
								<Save size={18} />
								Save Changes
							</Button>
						</div>
					</Card>
				</div>
			</form>
		</div>
	)
}
