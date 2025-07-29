// src/pages/dkm/setting/faq/FaqCategorySidebar.tsx
interface FaqCategorySidebarProps {
  categories: string[]
  selected: string
  onSelect: (value: string) => void
}

export default function MasjidFaqCategorySidebar({
  categories,
  selected,
  onSelect,
}: FaqCategorySidebarProps) {
  return (
    <div className="rounded-xl border p-4 space-y-2 bg-white dark:bg-[#1C1C1C]">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
            selected === cat
              ? 'bg-teal-600 text-white'
              : 'text-gray-700 hover:bg-teal-100 dark:text-gray-300 dark:hover:bg-teal-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
