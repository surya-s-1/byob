'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Image as ImageIcon, Shield, Globe, Lock } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function NewPublicationPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		displayName: '',
		displayDescription: '',
		visibility: 'PUBLIC',
		cover: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isLoading) return

		setIsLoading(true)
		try {
			const res = await fetch('/api/publications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			const data = await res.json()
			if (res.ok && data.publication?.slug) {
				router.push(`/publication/${data.publication.slug}`)
			} else {
				alert(data.error || 'Failed to create publication')
			}
		} catch (error) {
			console.error('Error creating publication:', error)
			alert('Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='max-w-3xl mx-auto px-4 py-12 space-y-8'>
			<div className='flex items-center gap-4'>
				<Link
					href='/dashboard'
					className='h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 text-main hover:bg-secondary transition-colors'
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<h1 className='text-2xl sm:text-3xl font-extrabold text-main tracking-tight line-height-[1.1]'>
						Create a Publication
					</h1>
					<p className='text-subtle text-sm'>
						Design a space for your best stories and writers.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<Card className='p-6 sm:p-8 space-y-8'>
					<div className='space-y-4'>
						<label className='block space-y-2'>
							<span className='text-sm font-bold text-main'>Display Name</span>
							<input
								required
								type='text'
								placeholder="What's your publication called?"
								className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
								value={formData.displayName}
								onChange={(e) =>
									setFormData({ ...formData, displayName: e.target.value })
								}
							/>
						</label>

						<label className='block space-y-2'>
							<span className='text-sm font-bold text-main'>Description</span>
							<textarea
								rows={3}
								placeholder='What is this publication about?'
								className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none'
								value={formData.displayDescription}
								onChange={(e) =>
									setFormData({ ...formData, displayDescription: e.target.value })
								}
							/>
						</label>
					</div>

					<div className='space-y-4'>
						<span className='text-sm font-bold text-main'>Visibility</span>
						<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
							{[
								{
									id: 'PUBLIC',
									label: 'Public',
									icon: <Globe size={18} />,
									desc: 'Visible to everyone',
								},
								{
									id: 'LOCKED',
									label: 'Locked',
									icon: <Lock size={18} />,
									desc: 'Members only',
								},
								{
									id: 'HIDDEN',
									label: 'Hidden',
									icon: <Shield size={18} />,
									desc: 'Only visible to you',
								},
							].map((opt) => (
								<button
									key={opt.id}
									type='button'
									onClick={() => setFormData({ ...formData, visibility: opt.id })}
									className={cn(
										'flex flex-col items-start p-4 rounded-xl border transition-all text-left group',
										formData.visibility === opt.id
											? 'border-main bg-main/5 shadow-sm'
											: 'border-border bg-secondary/30 hover:bg-secondary/50'
									)}
								>
									<div
										className={cn(
											'p-2 rounded-lg mb-2 transition-colors bg-secondary text-subtle group-hover:text-main'
										)}
									>
										{opt.icon}
									</div>
									<span className='text-sm font-bold text-main'>{opt.label}</span>
									<span className='text-xs text-muted'>{opt.desc}</span>
								</button>
							))}
						</div>
					</div>

					<div className='space-y-4'>
						<span className='text-sm font-bold text-main'>
							Cover Image URL (Optional)
						</span>
						<div className='flex gap-3'>
							<div className='flex-1'>
								<input
									type='url'
									placeholder='https://example.com/cover.png'
									className='w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
									value={formData.cover}
									onChange={(e) =>
										setFormData({ ...formData, cover: e.target.value })
									}
								/>
							</div>
						</div>
					</div>

					<div className='pt-4 flex justify-end'>
						<Button
							type='submit'
							isLoading={isLoading}
							className='btn-brand px-12 py-3 rounded-full text-base font-bold shadow-md'
						>
							Create Publication
						</Button>
					</div>
				</Card>
			</form>
		</div>
	)
}
