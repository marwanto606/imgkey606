import { useState } from "react"
import { Menu, X, Search, Camera, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onSearch: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.open(`https://stock.adobe.com/uk/contributor/211929995/marwanto606?k=${encodeURIComponent(searchQuery)}`, '_blank')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            ImgKey606
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </a>
          <a href="https://www.marwanto606.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
                Tools
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background border">
              <DropdownMenuItem asChild>
                <a href="/image-title-keyword" className="w-full">
                  Gen title keyword
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image-prompt" className="w-full">
                  Gen Image Prompt
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image-inspire" className="w-full">
                  Image Inspire
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stock images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-3">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="https://www.marwanto606.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className="flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
                >
                  Tools
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isToolsOpen && (
                  <div className="pl-4 space-y-2">
                    <a href="/image-title-keyword" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Gen title keyword
                    </a>
                    <a href="/image-prompt" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Gen Image Prompt
                    </a>
                    <a href="/image-inspire" className="block text-muted-foreground hover:text-foreground transition-colors">
                      Image Inspire
                    </a>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex flex-col space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stock images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}