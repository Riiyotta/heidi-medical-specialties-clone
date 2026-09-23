import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import AnnouncementBar from './components/AnnouncementBar.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import DownloadDrawer from './components/DownloadDrawer.jsx'
const GeneratedPage = lazy(() => import('./pages/GeneratedPage.jsx'))
const SolutionsPage = lazy(() => import('./pages/SolutionsPage.jsx'))
import solutions from './data/solutions.json'
import NotFound from './pages/NotFound.jsx'
import { PageFallback } from './components/Skeleton.jsx'
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ScribePage = lazy(() => import('./pages/ScribePage.jsx'))
const EvidencePage = lazy(() => import('./pages/EvidencePage.jsx'))
const CodingPage = lazy(() => import('./pages/CodingPage.jsx'))
const DictatePage = lazy(() => import('./pages/DictatePage.jsx'))
const HardwarePage = lazy(() => import('./pages/HardwarePage.jsx'))
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'))
const EnterprisePage = lazy(() => import('./pages/EnterprisePage.jsx'))
const TraineesPage = lazy(() => import('./pages/TraineesPage.jsx'))

// Pages hand-built band by band against the live site; everything else goes
// through SolutionsPage (the shared "For" layout) or the generic renderer.
const BUILT = {
  home: HomePage,
  scribe: ScribePage,
  evidence: EvidencePage,
  'product-coding': CodingPage,
  'product-dictate': DictatePage,
  hardware: HardwarePage,
  pricing: PricingPage,
  'solutions-enterprise': EnterprisePage,
  'solutions-medical-trainees': TraineesPage,
}
import { routes } from './data/routes.js'

const SOLUTION_SLUGS = Object.keys(solutions)

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-page">
        <AnnouncementBar />
        <Nav />
        <main id="main-content">
          {/* Routes are split per page, so each one shows live's section
              skeleton while its chunk is in flight. */}
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {routes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  element={(() => {
                    const Built = BUILT[r.slug]
                    if (Built) return <Built />
                    const sol = r.slug.replace(/^solutions-/, '')
                    if (r.slug.startsWith('solutions-') && SOLUTION_SLUGS.includes(sol)) return <SolutionsPage slug={sol} />
                    return <GeneratedPage slug={r.slug} />
                  })()}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <DownloadDrawer />
      </div>
    </BrowserRouter>
  )
}
