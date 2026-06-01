import { FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi'

interface TamperedStatsProps {
  totalTampered: number
  pendingReview: number
  highSeverity: number
  verified: number
}

export default function TamperedStats({ totalTampered, pendingReview, highSeverity, verified }: TamperedStatsProps) {
  return (
    <div className='mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
        <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1f0] text-[#a8071a]'>
          <FiAlertTriangle className='h-4 w-4' />
        </div>
        <p className='text-xs text-[#8c8c8c]'>Tampered Records</p>
        <p className='mt-1 text-xl font-semibold text-[#a8071a]'>{totalTampered.toString().padStart(2, '0')}</p>
        <p className='text-xs text-[#8c8c8c]'>Total Detected</p>
      </div>
      <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
        <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7e6] text-[#ad6800]'>
          <FiClock className='h-4 w-4' />
        </div>
        <p className='text-xs text-[#8c8c8c]'>Pending Review</p>
        <p className='mt-1 text-xl font-semibold text-[#ad6800]'>{pendingReview.toString().padStart(2, '0')}</p>
        <p className='text-xs text-[#8c8c8c]'>Needs Attention</p>
      </div>
      <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
        <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1f0] text-[#cf1322]'>
          <FiAlertTriangle className='h-4 w-4' />
        </div>
        <p className='text-xs text-[#8c8c8c]'>High Severity</p>
        <p className='mt-1 text-xl font-semibold text-[#a8071a]'>{highSeverity.toString().padStart(2, '0')}</p>
        <p className='text-xs text-[#8c8c8c]'>Critical Issues</p>
      </div>
      <div className='rounded-lg border border-[#f0f0f0] bg-[#fff] p-3'>
        <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f6ffed] text-[#237804]'>
          <FiCheckCircle className='h-4 w-4' />
        </div>
        <p className='text-xs text-[#8c8c8c]'>Verified Records</p>
        <p className='mt-1 text-xl font-semibold text-[#237804]'>{verified}</p>
        <p className='text-xs text-[#8c8c8c]'>All Good</p>
      </div>
    </div>
  )
}
