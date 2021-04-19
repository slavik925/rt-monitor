import clsx from 'clsx'
import '../styles.css'

export async function getEdgeProps() {
  const sites = URLS.split(',').map((url) => url.replace(/\s/g, ''))
  const promises = []

  for (const site of sites) {
    promises.push(fetch(site, { cf: { cacheTtl: -1 } }))
    promises.push(fetch(`${site}/swagger`, { cf: { cacheTtl: -1 } }))
    promises.push(fetch(`${site}/api/authorization/login`, { cacheTtl: -1 }))
  }

  const results = await Promise.all(promises)

  const siteChecks = sites.map((site, i) => ({
    name: site,
    uiStatus: results[i * 3].status === 200,
    swaggerStatus: results[i * 3 + 1].status === 200,
    apiStatus: results[i * 3 + 2].status.toString().charAt(0) !== '5',
  }))

  return {
    props: {
      sites: siteChecks,
    },
    revalidate: 0
  }
}

const StatusLabel = ({ name, isAlive }) => (
  <div>
    <span
      className={clsx('p-2 rounded mr-3 ', {
        'text-green-600 bg-green-100': isAlive,
        'text-red-600 bg-red-100': !isAlive,
      })}
    >
      <span className="text-xl font-bold text-gray-800 mr-1">{name}</span>
      <span className="font-semibold">{isAlive ? 'OK' : 'BAD'}</span>
    </span>
  </div>
)

const StatusCard = ({ name, uiStatus, apiStatus, swaggerStatus }) => (
  <div className="p-6 bg-white rounded shadow-sm min-w-min">
    <div className="text-normal font-medium	text-indigo-800">
      <a href={name}>{name}</a>
    </div>
    <div className="flex items-center pt-3">
      <StatusLabel name="UI" isAlive={uiStatus} />
      <StatusLabel name="API" isAlive={apiStatus} />
      <StatusLabel name="SWAGGER" isAlive={swaggerStatus} />
    </div>
  </div>
)

export default function Index({ sites }) {
  return (
    <div className="bg-gray-200 flex items-center min-h-screen">
      <div className="container max-w-7xl px-5 mx-auto">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((siteCheck) => (
            <StatusCard key={siteCheck.name} {...siteCheck} />
          ))}
        </div>
      </div>
    </div>
  )
}
