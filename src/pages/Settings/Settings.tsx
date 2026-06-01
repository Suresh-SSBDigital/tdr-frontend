export default function Settings() {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-indigo-600">Configuration</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Site Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage security, notifications, and system preferences.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Change Password</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use a strong password with at least 8 characters.</p>

          <div className="mt-5 space-y-3">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <button
            type="button"
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Update Password
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Preferences</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control default view and notification behavior.</p>

          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive critical workflow alerts</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-300">Default landing page</span>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option>Dashboard Overview</option>
                <option>DRC Certificates</option>
                <option>Purchase Notification</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Save Preferences
          </button>
        </article>
      </div>
    </section>
  )
}