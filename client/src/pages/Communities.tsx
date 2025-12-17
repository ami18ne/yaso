import React from 'react'
import { Link } from 'wouter'
import { useCommunities } from '@/hooks/useCommunities'
import { useAuth } from '@/contexts/AuthContext'
import CreateCommunityDialog from '@/components/CreateCommunityDialog'
import DiscoverCommunities from '@/components/Community/DiscoverCommunities'
import CommunityCard from '@/components/Community/CommunityCard'
import { Users, Calendar } from 'lucide-react'

export default function Communities() {
  const { user } = useAuth()
  const { data: communities = [], isLoading, error } = useCommunities()
  const [showDiscover, setShowDiscover] = React.useState(false)
  
  const errorMessage = error ? (typeof error === 'string' ? error : error.message || JSON.stringify(error)) : ''
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Communities</h1>
              <p className="text-muted-foreground mt-1">Connect with others and build communities</p>
            </div>
            <CreateCommunityDialog />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading communities...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-destructive mb-2">Error Loading Communities</h3>
            <p className="text-sm text-destructive/90 mb-4">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {communities.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Communities Yet</h3>
            <p className="text-muted-foreground mb-6">Join a community or create your own to get started</p>
            <div className="flex items-center justify-center gap-3">
              <button id="discover-communities" onClick={() => setShowDiscover(true)} className="px-4 py-2 bg-primary text-white rounded">Join Community</button>
              <CreateCommunityDialog />
            </div>
          </div>
        )}

        {communities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{communities.length} community(ies)</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowDiscover(true)} className="px-3 py-1 bg-secondary text-white rounded text-sm">Discover Communities</button>
                <CreateCommunityDialog />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((c: any) => (
                <Link href={`/communities/${c.id}`} key={c.id} className="no-underline">
                  <div className="group relative">
                    <div className="bg-card border border-border rounded-lg p-4 hover:shadow transition">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold line-clamp-2">{c.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded">{c.visibility || 'public'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(c.created_at).toLocaleDateString()}</span></div>
                        <div className="text-primary font-medium">View →</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showDiscover && <DiscoverCommunities onClose={() => setShowDiscover(false)} />}
      </div>
    </div>
  )
}
