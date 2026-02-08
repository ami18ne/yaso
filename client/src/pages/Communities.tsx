import CommunityCard from '@/components/Community/CommunityCard'
import CreateCommunityDialog from '@/components/CreateCommunityDialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunities, useDiscoverCommunities } from '@/hooks/useCommunities'
import React from 'react'
import { Link } from 'wouter'

export default function CommunitiesPage() {
  const { user } = useAuth()
  const { data: userCommunities = [], isLoading: isLoadingUserCommunities } = useCommunities()
  const { data: discoverCommunities = [], isLoading: isLoadingDiscover } = useDiscoverCommunities(
    '',
    1,
    6
  )

  const userCommunityIds = React.useMemo(
    () => new Set(userCommunities.map((c: any) => c.id)),
    [userCommunities]
  )

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4 sm:mb-0">
          Communities
        </h1>
        <div className="flex items-center gap-2">
          <CreateCommunityDialog />
        </div>
      </header>

      {/* User's Communities */}
      {user && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Your Communities</h2>
          {isLoadingUserCommunities ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : userCommunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities.map((community: any) => (
                <Link key={community.id} href={`/communities/${community.id}`}>
                  <a className="block transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg h-full">
                    <CommunityCard community={community} isMember={true} />
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center border-2 border-dashed border-border rounded-lg py-12">
              <p className="text-muted-foreground mb-4">You haven't joined any communities yet.</p>
              <p className="text-sm text-muted-foreground">
                Find a community below or create your own!
              </p>
            </div>
          )}
        </section>
      )}

      {/* Discover Communities */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Discover New Places</h2>
          <Link href="/communities/discover">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {isLoadingDiscover ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : discoverCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverCommunities.map((community: any) => (
              <Link key={community.id} href={`/communities/${community.id}`}>
                <a className="block transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg h-full">
                  <CommunityCard
                    community={community}
                    isMember={userCommunityIds.has(community.id)}
                  />
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center border-2 border-dashed border-border rounded-lg py-12">
            <p className="text-muted-foreground">No public communities to show right now.</p>
          </div>
        )}
      </section>
    </div>
  )
}
