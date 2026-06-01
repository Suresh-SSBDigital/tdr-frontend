import { useTdr } from '../../context/useTdr'

export default function Profile() {
  const { userProfile } = useTdr()
  const profileName = userProfile?.name || 'User Name'
  const profileEmail = userProfile?.email || 'user@email.com'
  const profileInitial = profileName.charAt(0).toUpperCase() || 'U'

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-indigo-600">Account</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">My Profile</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Update your personal information and contact details.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {profileInitial}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{profileName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profileEmail}</p>
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Change Photo
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Personal Details</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Keep your profile details up to date for better communication.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-300">Full Name</span>
              <input
                type="text"
                defaultValue={profileName}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-300">Mobile Number</span>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-300">Email Address</span>
              <input
                type="email"
                defaultValue={profileEmail}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-300">Designation</span>
              <input
                type="text"
                defaultValue="Planning Officer"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}