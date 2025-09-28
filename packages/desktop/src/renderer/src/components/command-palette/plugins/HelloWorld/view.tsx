import { useState } from 'react'
import { Sparkles, Search, FileText, Settings, Heart, Coffee } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  DetailLayout,
  DetailSidebar,
  DetailMain,
  DetailSection,
  DetailItem,
  DetailInput,
  DetailButton,
  DetailStatus,
  DetailLoading,
  DetailEmpty
} from '../../components/common'
import { cn } from '@clarity/shadcn'
import type { PluginContext } from '../types'

const SAMPLE_ITEM_IDS = ['item-1', 'item-2', 'item-3', 'item-4'] as const

type SampleItemId = (typeof SAMPLE_ITEM_IDS)[number]
type Category = 'overview' | 'search' | 'favorites' | 'settings'

interface SidebarItem {
  id: Category
  icon: LucideIcon
  badge?: string
}

interface HelloWorldViewProps {
  context: PluginContext
  version: string
}

export function HelloWorldView({ context, version }: HelloWorldViewProps) {
  const query = context.commandPalette.getQuery()
  const { i18n } = context
  const t = i18n.t

  const categories = {
    overview: t('view.sidebar.overview', { defaultValue: 'Overview' }),
    search: t('view.sidebar.search', { defaultValue: 'Search' }),
    favorites: t('view.sidebar.favorites', { defaultValue: 'Favorites' }),
    settings: t('view.sidebar.settings', { defaultValue: 'Settings' })
  }

  const [selectedCategory, setSelectedCategory] = useState<Category>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [favorites, setFavorites] = useState<SampleItemId[]>(['item-1', 'item-3'])
  const [visibleItems, setVisibleItems] = useState<SampleItemId[]>([...SAMPLE_ITEM_IDS])

  const getItemMeta = (id: SampleItemId) => ({
    id,
    name: t(`view.search.items.${id}.name`, { defaultValue: id }),
    type: t(`view.search.items.${id}.type`, { defaultValue: 'File' }),
    modified: t(`view.search.items.${id}.modified`, { defaultValue: '' }),
    size: t(`view.search.items.${id}.size`, { defaultValue: '' })
  })

  const handleSearch = async () => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    setIsLoading(true)
    setStatus('idle')

    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (normalizedQuery.includes('error')) {
      setStatus('error')
      setIsLoading(false)
      return
    }

    const filtered = normalizedQuery
      ? SAMPLE_ITEM_IDS.filter((id) =>
          getItemMeta(id).name.toLowerCase().includes(normalizedQuery)
        )
      : [...SAMPLE_ITEM_IDS]

    setVisibleItems(filtered)
    setStatus('success')
    setIsLoading(false)
  }

  const toggleFavorite = (itemId: SampleItemId) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleReset = () => {
    setSearchQuery('')
    setStatus('idle')
    setVisibleItems([...SAMPLE_ITEM_IDS])
  }

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', icon: Sparkles },
    { id: 'search', icon: Search },
    { id: 'favorites', icon: Heart, badge: favorites.length.toString() },
    { id: 'settings', icon: Settings }
  ]

  const renderSidebar = () => (
    <DetailSidebar>
      <DetailSection title={t('view.sidebarTitle', { defaultValue: 'Categories' })}>
        {sidebarItems.map((item) => (
          <DetailItem
            key={item.id}
            icon={item.icon}
            title={categories[item.id]}
            badge={item.badge}
            onClick={() => setSelectedCategory(item.id)}
            className={cn(selectedCategory === item.id ? 'bg-accent/60' : '', 'w-full')}
          />
        ))}
      </DetailSection>
    </DetailSidebar>
  )

  const renderOverview = () => (
    <>
      <DetailSection title={t('view.overview.title', { defaultValue: 'Plugin overview' })}>
        <DetailStatus
          status="success"
          message={t('view.overview.statusOk', {
            defaultValue: 'HelloWorld plugin is running correctly'
          })}
        />

        {query && (
          <DetailItem
            icon={Search}
            title={t('view.overview.queryLabel', { defaultValue: 'Current query' })}
            subtitle={`"${query}"`}
            description={t('view.overview.queryDescription', {
              defaultValue: 'This query comes from the command palette'
            })}
          />
        )}

        <DetailItem
          icon={FileText}
          title={t('view.overview.infoTitle', { defaultValue: 'Plugin information' })}
          subtitle={t('view.overview.infoSubtitle', {
            defaultValue: 'Version {{version}}',
            version
          })}
          description={t('view.overview.infoDescription', {
            defaultValue: 'A complete example that demonstrates the detail view components.'
          })}
          badge={t('view.overview.infoBadge', { defaultValue: 'Example' })}
        />
      </DetailSection>

      <DetailSection title={t('view.overview.featuresTitle', { defaultValue: 'Highlights' })}>
        <DetailItem
          icon={Coffee}
          title={t('view.overview.readyTitle', { defaultValue: 'Ready to use' })}
          subtitle={t('view.overview.readySubtitle', { defaultValue: 'No extra configuration' })}
          description={t('view.overview.readyDescription', {
            defaultValue: 'Plugin developers can focus on delivering value.'
          })}
        />
      </DetailSection>
    </>
  )

  const renderSearch = () => (
    <>
      <DetailSection title={t('view.search.title', { defaultValue: 'Search demo' })}>
        <DetailInput
          icon={Search}
          placeholder={t('view.search.placeholder', {
            defaultValue: 'Search files…'
          })}
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          onEnter={handleSearch}
        />

        <div className="flex gap-2">
          <DetailButton onClick={handleSearch} disabled={isLoading} variant="default">
            {t('view.search.run', { defaultValue: 'Search' })}
          </DetailButton>
          <DetailButton onClick={handleReset} variant="outline">
            {t('view.search.reset', { defaultValue: 'Reset' })}
          </DetailButton>
        </div>

        {status === 'success' && (
          <DetailStatus
            status="success"
            message={t('view.search.statusSuccess', { defaultValue: 'Search completed' })}
          />
        )}
        {status === 'error' && (
          <DetailStatus
            status="error"
            message={t('view.search.statusError', { defaultValue: 'Search failed. Please try again.' })}
          />
        )}
      </DetailSection>

      <DetailSection title={t('view.search.resultsTitle', { defaultValue: 'Search results' })}>
        {isLoading ? (
          <DetailLoading message={t('view.search.loading', { defaultValue: 'Searching…' })} />
        ) : visibleItems.length === 0 ? (
          <DetailEmpty
            icon={Search}
            title={t('view.search.emptyTitle', { defaultValue: 'No files found' })}
            description={t('view.search.emptyDescription', {
              defaultValue: 'Try adjusting your search keywords.'
            })}
            action={
              <DetailButton onClick={handleReset}>
                {t('view.search.emptyAction', { defaultValue: 'Reset search' })}
              </DetailButton>
            }
          />
        ) : (
          visibleItems.map((id) => {
            const meta = getItemMeta(id)
            return (
              <DetailItem
                key={id}
                icon={FileText}
                title={meta.name}
                subtitle={[meta.modified, meta.size].filter(Boolean).join(' • ')}
                badge={meta.type}
                onClick={() => {
                  window.alert(
                    t('view.search.openMessage', {
                      defaultValue: 'Opening file: {{name}}',
                      name: meta.name
                    })
                  )
                }}
                className="w-full"
              >
                <DetailButton
                  icon={Heart}
                  onClick={(event) => {
                    event?.stopPropagation()
                    toggleFavorite(id)
                  }}
                  variant="ghost"
                >
                  {favorites.includes(id)
                    ? t('view.favorites.removeAction', { defaultValue: 'Remove' })
                    : t('view.favorites.addAction', { defaultValue: 'Save' })}
                </DetailButton>
              </DetailItem>
            )
          })
        )}
      </DetailSection>
    </>
  )

  const renderFavorites = () => (
      <DetailSection title={t('view.favorites.title', { defaultValue: 'Favorites' })}>
      {favorites.length === 0 ? (
        <DetailEmpty
          icon={Heart}
          title={t('view.favorites.title', { defaultValue: 'Favorites' })}
          description={t('view.favorites.empty', {
            defaultValue: 'Save results from the search panel to revisit them quickly.'
          })}
        />
      ) : (
        favorites.map((id) => {
          const meta = getItemMeta(id)
          return (
            <DetailItem
              key={id}
              icon={FileText}
              title={meta.name}
              subtitle={[meta.modified, meta.size].filter(Boolean).join(' • ')}
              badge={meta.type}
              onClick={() => {
                window.alert(
                  t('view.search.openMessage', {
                    defaultValue: 'Opening file: {{name}}',
                    name: meta.name
                  })
                )
              }}
              className="w-full"
            >
              <DetailButton
                icon={Heart}
                variant="ghost"
                onClick={(event) => {
                  event?.stopPropagation()
                  toggleFavorite(id)
                }}
              >
                {t('view.favorites.removeAction', { defaultValue: 'Remove' })}
              </DetailButton>
            </DetailItem>
          )
        })
      )}
    </DetailSection>
  )

  const renderSettings = () => (
    <DetailSection title={t('view.settings.title', { defaultValue: 'Settings' })}>
      <DetailStatus
        status="info"
        message={t('view.settings.description', {
          defaultValue: 'Settings demo coming soon.'
        })}
      />
    </DetailSection>
  )

  return (
    <DetailLayout>
      {renderSidebar()}
      <DetailMain>
        {selectedCategory === 'overview' && renderOverview()}
        {selectedCategory === 'search' && renderSearch()}
        {selectedCategory === 'favorites' && renderFavorites()}
        {selectedCategory === 'settings' && renderSettings()}
      </DetailMain>
    </DetailLayout>
  )
}
