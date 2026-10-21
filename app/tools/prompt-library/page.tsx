'use client'

import { useState, useMemo } from 'react'
import library from '../../../shared/prompts/library.json'

type Prompt = {
  id: string
  title: string
  description: string
  template: string
  variables: string[]
  profession?: string[]
}

type Category = {
  id: string
  label: string
  icon: string
  prompts: Prompt[]
}

const categories: Category[] = library.categories as Category[]
const allProfessions = Array.from(
  new Set(categories.flatMap(c => c.prompts.flatMap(p => p.profession ?? [])))
).sort()

export default function PromptLibraryPage() {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<string>('all')
  const [activeProfession, setActiveProfession] = useState<string>('all')
  const [selected, setSelected] = useState<Prompt | null>(null)
  const [vars, setVars] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return categories.flatMap(cat => {
      if (activeCat !== 'all' && cat.id !== activeCat) return []
      return cat.prompts.filter(p => {
        const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        const matchProf = activeProfession === 'all' || p.profession?.includes(activeProfession)
        return matchSearch && matchProf
      }).map(p => ({ ...p, categoryIcon: cat.icon, categoryLabel: cat.label }))
    })
  }, [search, activeCat, activeProfession])

  function openPrompt(p: Prompt) {
    setSelected(p)
    setVars(Object.fromEntries(p.variables.map(v => [v, ''])))
    setCopied(false)
  }

  function filledTemplate(): string {
    if (!selected) return ''
    let t = selected.template
    for (const [k, v] of Object.entries(vars)) {
      t = t.replaceAll(`{${k}}`, v || `{${k}}`)
    }
    return t
  }

  function copyTemplate() {
    navigator.clipboard.writeText(filledTemplate())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: '1px solid #1f2937', padding: '24px 16px', overflowY: 'auto', flexShrink: 0 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Библиотека промптов</h2>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Категория</div>
          {[{ id: 'all', label: 'Все', icon: '📚' }, ...categories].map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeCat === c.id ? '#1f2937' : 'transparent',
                color: activeCat === c.id ? '#fff' : '#9ca3af',
                fontSize: 13, marginBottom: 2,
              }}
            >
              {'icon' in c ? `${c.icon} ` : ''}{c.label}
            </button>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Профессия</div>
          {['all', ...allProfessions].map(p => (
            <button
              key={p}
              onClick={() => setActiveProfession(p)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeProfession === p ? '#1f2937' : 'transparent',
                color: activeProfession === p ? '#fff' : '#9ca3af',
                fontSize: 12, marginBottom: 1,
              }}
            >
              {p === 'all' ? 'Все' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Search */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937' }}>
          <input
            placeholder="Поиск промптов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#111', color: '#fff', border: '1px solid #333',
              borderRadius: 10, padding: '10px 16px', fontSize: 14,
            }}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {filtered.length} промптов · v{library.version} · обновлено {library.updated}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Prompt grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => openPrompt(p)}
                  style={{
                    background: selected?.id === p.id ? '#1a1f3a' : '#0d1117',
                    border: `1px solid ${selected?.id === p.id ? '#6366f1' : '#1f2937'}`,
                    borderRadius: 10, padding: '16px', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: '#6366f1', background: '#1a1f3a', padding: '2px 8px', borderRadius: 20 }}>
                      {('categoryIcon' in p ? p.categoryIcon as string : '') + ' ' + ('categoryLabel' in p ? p.categoryLabel as string : '')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{p.description}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>
                    {p.variables.length} переменных
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ width: 380, borderLeft: '1px solid #1f2937', overflowY: 'auto', padding: '20px 20px', flexShrink: 0 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{selected.title}</h3>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>{selected.description}</p>

              {selected.variables.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: '#9ca3af' }}>ЗАПОЛНИ ПЕРЕМЕННЫЕ</div>
                  {selected.variables.map(v => (
                    <div key={v} style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 11, color: '#6366f1', marginBottom: 4 }}>{v}</label>
                      <input
                        value={vars[v] || ''}
                        onChange={e => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`{${v}}`}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: '#111', color: '#fff',
                          border: '1px solid #333', borderRadius: 6, padding: '7px 10px', fontSize: 13,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#9ca3af' }}>РЕЗУЛЬТАТ</div>
                <pre style={{
                  background: '#0a0a0a', border: '1px solid #1f2937', borderRadius: 8,
                  padding: '12px', fontSize: 12, whiteSpace: 'pre-wrap', color: '#e5e7eb',
                  maxHeight: 280, overflowY: 'auto', lineHeight: 1.55,
                }}>
                  {filledTemplate()}
                </pre>
              </div>

              <button
                onClick={copyTemplate}
                style={{
                  width: '100%', padding: '10px', background: copied ? '#16a34a' : '#6366f1',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {copied ? '✓ Скопировано!' : 'Скопировать промпт'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
