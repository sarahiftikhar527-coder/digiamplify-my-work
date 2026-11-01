import { useRoutes } from 'react-router-dom'
import { routesConfig } from './routes.config'
import { ScrollToTop } from './ScrollToTop'

export function AppRouter() {
  const routes = useRoutes(routesConfig)

  return (
    <>
      <ScrollToTop />
      {routes}
    </>
  )
}