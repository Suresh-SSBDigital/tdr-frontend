import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const monthlyIssuance = [
  { month: 'Jan', issued: 120 },
  { month: 'Feb', issued: 160 },
  { month: 'Mar', issued: 190 },
  { month: 'Apr', issued: 220 },
  { month: 'May', issued: 180 },
  { month: 'Jun', issued: 240 },
]

const statusDistribution = [
  { name: 'Active', value: 980, color: '#4f46e5' },
  { name: 'Transferred', value: 210, color: '#0ea5e9' },
  { name: 'Utilized', value: 55, color: '#16a34a' },
  { name: 'Pending', value: 34, color: '#f59e0b' },
  { name: 'Revoked', value: 12, color: '#ef4444' },
]

const txTrend = [
  { month: 'Jan', tx: 85 },
  { month: 'Feb', tx: 105 },
  { month: 'Mar', tx: 145 },
  { month: 'Apr', tx: 175 },
  { month: 'May', tx: 132 },
  { month: 'Jun', tx: 188 },
]

const cardStyle = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function Charts() {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className={`${cardStyle} xl:col-span-1`}>
        <h3 className="mb-3 font-semibold">Monthly Issuance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyIssuance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="issued" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cardStyle} xl:col-span-1`}>
        <h3 className="mb-3 font-semibold">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={90}>
              {statusDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cardStyle} xl:col-span-1`}>
        <h3 className="mb-3 font-semibold">Transaction Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={txTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tx" stroke="#0ea5e9" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
