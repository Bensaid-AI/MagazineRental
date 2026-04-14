'use client'
import { useState } from 'react'

interface ValidationRequest {
  id: number
  userName: string
  userEmail: string
  type: string
  description: string
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected'
  document?: string
}

export default function Validation() {
  const [validations, setValidations] = useState<ValidationRequest[]>([
    {
      id: 1,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      type: 'Identity Verification',
      description: 'Passport verification for new landlord account',
      submittedDate: '2024-03-15',
      status: 'pending',
      document: 'passport.pdf',
    },
    {
      id: 2,
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      type: 'Property Listing',
      description: 'New property listing verification - 2BR apartment',
      submittedDate: '2024-03-14',
      status: 'pending',
      document: 'property_docs.pdf',
    },
    {
      id: 3,
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      type: 'Payment Method',
      description: 'Bank account verification for payment processing',
      submittedDate: '2024-03-12',
      status: 'pending',
      document: 'bank_statement.pdf',
    },
    {
      id: 4,
      userName: 'Alice Williams',
      userEmail: 'alice@example.com',
      type: 'Identity Verification',
      description: 'Driving license verification',
      submittedDate: '2024-03-10',
      status: 'approved',
    },
  ])

  const [filterStatus, setFilterStatus] = useState('pending')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)

  const filteredValidations = validations.filter((v) =>
    filterStatus === 'all' ? true : v.status === filterStatus
  )

  const handleApprove = (id: number) => {
    setValidations(
      validations.map((v) => (v.id === id ? { ...v, status: 'approved' } : v))
    )
  }

  const handleReject = (id: number) => {
    if (rejectReason.trim()) {
      setValidations(
        validations.map((v) => (v.id === id ? { ...v, status: 'rejected' } : v))
      )
      setShowRejectModal(null)
      setRejectReason('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Validation Requests</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Pending: {validations.filter((v) => v.status === 'pending').length}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <div className="flex space-x-2">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Requests */}
      <div className="space-y-4">
        {filteredValidations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600">No validation requests found</p>
          </div>
        ) : (
          filteredValidations.map((validation) => (
            <div key={validation.id} className="bg-white rounded-lg shadow">
              {/* Main Row */}
              <div className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{validation.userName}</p>
                    <p className="text-sm text-gray-600">{validation.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{validation.type}</p>
                    <p className="text-sm text-gray-600">{validation.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{validation.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        validation.status
                      )}`}
                    >
                      {validation.status.charAt(0).toUpperCase() + validation.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === validation.id ? null : validation.id)
                      }
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                    >
                      {expandedId === validation.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === validation.id && (
                <div className="p-6 bg-gray-50">
                  <div className="space-y-4">
                    {validation.document && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Document:</p>
                        <div className="flex items-center space-x-2 p-3 bg-white rounded border border-gray-200">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">{validation.document}</span>
                          <button className="ml-auto text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Download
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                        {validation.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {validation.status === 'pending' && (
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => handleApprove(validation.id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(validation.id)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Reject Modal */}
                    {showRejectModal === validation.id && (
                      <div className="mt-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                        <p className="text-sm font-medium text-gray-900 mb-2">Rejection Reason:</p>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Please provide a reason for rejection..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm mb-2"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReject(validation.id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
                          >
                            Submit Rejection
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(null)
                              setRejectReason('')
                            }}
                            className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
