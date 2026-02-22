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
		<div className='max-w-4xl mx-auto px-4 py-12 space-y-8'>
			<div className='flex items-center gap-4'>
				<Link
					href={`/profile/${user.username}`}
					className='h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-main hover:bg-secondary transition-colors'
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight'>
						Edit Profile
					</h1>
					<p className='text-subtle text-sm'>
						Manage your public presence and personal details.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				<div className='md:col-span-1 space-y-6'>
					<Card className='p-6 text-center space-y-6'>
						<div className='relative h-32 w-32 mx-auto'>
							<div className='h-full w-full rounded-full overflow-hidden bg-secondary border-4 border-primary/20 relative group'>
								{formData.image ? (
									<Image
										src={formData.image}
										alt={formData.name}
										fill
										className='object-cover'
									/>
								) : (
									<div className='h-full w-full flex items-center justify-center text-muted'>
										<User size={48} />
									</div>
								)}
								<div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
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
								className='w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-main focus:outline-none focus:ring-1 focus:ring-primary'
								value={formData.image}
								onChange={(e) =>
									setFormData({ ...formData, image: e.target.value })
								}
							/>
						</div>
					</Card>

					<div className='bg-secondary/20 rounded-2xl p-6 border border-border/50 space-y-4'>
						<h4 className='text-xs font-bold uppercase tracking-widest text-muted'>
							Privacy Note
						</h4>
						<div className='flex items-start gap-3'>
							<Globe size={16} className='text-main flex-shrink-0 mt-0.5' />
							<p className='text-xs text-subtle leading-relaxed'>
								Your <strong>Name</strong> and <strong>Bio</strong> are visible to
								everyone on the platform.
							</p>
						</div>
						<div className='flex items-start gap-3'>
							<Lock size={16} className='text-main flex-shrink-0 mt-0.5' />
							<p className='text-xs text-subtle leading-relaxed'>
								Your <strong>Date of Birth</strong> is only visible to you on your
								profile page.
							</p>
						</div>
					</div>
				</div>

				<div className='md:col-span-2 space-y-6'>
					<Card className='p-6 sm:p-8 space-y-6'>
						<div className='space-y-4'>
							<label className='block space-y-2'>
								<span className='text-sm font-bold text-main'>Display Name</span>
								<input
									required
									type='text'
									className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
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
									className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none'
									value={formData.bio || ''}
									onChange={(e) =>
										setFormData({ ...formData, bio: e.target.value })
									}
								/>
								<div className='text-[10px] text-right text-muted'>
									{(formData.bio || '').length}/160
								</div>
							</label>

							<label className='block space-y-2'>
								<span className='text-sm font-bold text-main'>Date of Birth</span>
								<input
									type='date'
									className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
									value={formData.dob || ''}
									onChange={(e) =>
										setFormData({ ...formData, dob: e.target.value })
									}
								/>
							</label>
						</div>

						<div className='pt-6 flex justify-end gap-3'>
							<Link href={`/profile/${user.username}`}>
								<Button className='bg-secondary text-main border border-border px-6'>
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
