import React from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import CreateForm from '@/components/sweepstake/CreateForm'

export const metadata: Metadata = {
  title: 'Create Sweepstake | World Cup Sweepstakes',
  description: 'Create a new sweepstake for your friends, family, or colleagues. Choose tournaments, set entry fees, and customize your experience.',
}

// Mock function to simulate sweepstake creation
// In a real app, this would connect to your API/database
async function createSweepstake(data: any) {
  'use server'
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock validation
  if (!data.name || !data.tournament) {
    throw new Error('Name and tournament are required')
  }
  
  // Mock successful creation - generate a fake ID
  const sweepstakeId = 'sweep_' + Math.random().toString(36).substr(2, 9)
  
  // In a real app, you would:
  // 1. Validate the user is authenticated
  // 2. Create the sweepstake in the database
  // 3. Generate invite codes if private
  // 4. Set up initial configuration
  
  console.log('Created sweepstake:', { id: sweepstakeId, ...data })
  
  // Redirect to the new sweepstake page
  redirect(`/sweepstake/${sweepstakeId}`)
}

async function CreateSweepstakePage() {
  const handleCreateSweepstake = async (formData: any) => {
    'use server'
    await createSweepstake(formData)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Sweepstakes</span>
              </a>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/sweepstakes" className="text-slate-300 hover:text-white transition-colors">
                My Sweepstakes
              </a>
              <a href="/tournaments" className="text-slate-300 hover:text-white transition-colors">
                Tournaments
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-slate-300 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Create Your Sweepstake
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Set up a new sweepstake for your friends, family, or colleagues. 
            Choose from popular tournaments and customize the experience.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Setup</h3>
            <p className="text-slate-400 text-sm">
              Create your sweepstake in minutes with our simple step-by-step process.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiple Tournaments</h3>
            <p className="text-slate-400 text-sm">
              Choose from World Cup, Euro, Copa América, and popular league tournaments.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fully Customizable</h3>
            <p className="text-slate-400 text-sm">
              Set entry fees, participant limits, privacy settings, and more to suit your needs.
            </p>
          </div>
        </div>

        {/* Create Form */}
        <CreateForm onSubmit={handleCreateSweepstake} />

        {/* Help Section */}
        <div className="mt-12 bg-slate-900 rounded-lg border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-200 mb-2">How do sweepstakes work?</h4>
              <p className="text-sm text-slate-400">
                Participants join your sweepstake and get randomly assigned teams. 
                Winners are determined based on tournament results and your chosen scoring system.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-slate-200 mb-2">Can I modify settings later?</h4>
              <p className="text-sm text-slate-400">
                Some settings like participant limits and privacy can be changed before the tournament starts. 
                Entry fees and tournament selection cannot be modified after creation.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Still have questions? Check out our{' '}
              <a href="/help" className="text-emerald-400 hover:text-emerald-300 underline">
                help center
              </a>{' '}
              or{' '}
              <a href="/contact" className="text-emerald-400 hover:text-emerald-300 underline">
                contact support
              </a>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p>&copy; 2024 World Cup Sweepstakes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CreateSweepstakePage