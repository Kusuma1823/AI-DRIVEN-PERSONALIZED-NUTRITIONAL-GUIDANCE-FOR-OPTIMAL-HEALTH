import React, { useMemo, useState, useEffect } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { dbClient } from "../../lib/database/dbClient";
import { loadCommunityPosts } from "../../features/community/communityStorage";

export function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [feedbackTickets, setFeedbackTickets] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Load data from database
  const loadData = async () => {
    try {
      const [usersData, feedbackData, contactData, communitiesData] = await Promise.all([
        dbClient.auth.getAllUsers().catch(e => { console.error("Users error:", e); return []; }),
        dbClient.feedback.getAll().catch(e => { console.error("Feedback error:", e); return []; }),
        dbClient.contact.getAll().catch(e => { console.error("Contact error:", e); return []; }),
        dbClient.community.getAll().catch(e => { console.error("Community error:", e); return []; }),
      ]);
      
      console.log("Admin Data Loaded:", { usersData, feedbackData, contactData, communitiesData });
      setUsers(usersData || []);
      setFeedbackTickets(feedbackData || []);
      setContactSubmissions(contactData || []);
      setCommunityPosts(communitiesData || []);
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate user analytics
  const userAnalytics = useMemo(() => {
    const analytics: Record<string, any> = {};
    
    users.forEach((user) => {
      const userPosts = communityPosts.filter((post) => post.authorEmail === user.email);
      const userFeedback = feedbackTickets.filter((ticket) => ticket.contactEmail === user.email);
      const userContacts = contactSubmissions.filter((submission) => submission.email === user.email);
      
      analytics[user.email] = {
        ...user,
        postCount: userPosts.length,
        feedbackCount: userFeedback.length,
        contactCount: userContacts.length,
        communityPosts: userPosts,
        feedbackTickets: userFeedback,
        contactMessages: userContacts,
        totalEngagement: userPosts.length + userFeedback.length + userContacts.length,
      };
    });
    
    return analytics;
  }, [users, communityPosts, feedbackTickets, contactSubmissions]);

  const selectedUserData = selectedUser ? userAnalytics[selectedUser] : null;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8">        {/* Refresh Button */}
        <div className="mb-6 flex gap-2">
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-chai-100 text-white rounded-lg hover:bg-chai-200 transition-colors font-medium text-sm"
          >
            🔄 Refresh Data
          </button>
          <span className="text-xs text-gray-600 self-center">(Auto-refreshes every 3 seconds)</span>
        </div>        <div className="mb-12">
          <h1 className="text-4xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Complete user analytics, activity tracking, and feedback management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 lg:grid-cols-4 mb-8">
          <Card className="p-6 shadow-lg">
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Total Users</div>
            <div className="mt-3 text-4xl font-bold text-blue-600">{users.length}</div>
            <div className="mt-2 text-xs text-gray-600">Registered users</div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Community Posts</div>
            <div className="mt-3 text-4xl font-bold text-green-600">{communityPosts.length}</div>
            <div className="mt-2 text-xs text-gray-600">User posted content</div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Contact Submissions</div>
            <div className="mt-3 text-4xl font-bold text-orange-600">{contactSubmissions.length}</div>
            <div className="mt-2 text-xs text-gray-600">Messages received</div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Feedback Tickets</div>
            <div className="mt-3 text-4xl font-bold text-red-600">{feedbackTickets.length}</div>
            <div className="mt-2 text-xs text-gray-600">Complaints & feedback</div>
          </Card>
        </div>

        {/* User Details Section */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* User List */}
          <Card className="p-8 shadow-lg lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-ink-900">Users</h2>
              <p className="mt-1 text-sm text-gray-600">Click to view details</p>
            </div>
            {users.length === 0 ? (
              <p className="text-gray-600 text-sm">No users yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => {
                  const analytics = userAnalytics[user.email];
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.email)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedUser === user.email
                          ? "border-chai-100 bg-yellow-50"
                          : "border-gray-200 hover:border-chai-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Activity: {analytics.totalEngagement}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Selected User Analytics */}
          {selectedUserData && (
            <Card className="p-8 shadow-lg lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-ink-900">{selectedUserData.name}</h2>
                <p className="text-sm text-gray-600">{selectedUserData.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Joined: {new Date(selectedUserData.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* User Activity Stats */}
              <div className="grid gap-4 mb-6 grid-cols-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedUserData.postCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Community Posts</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedUserData.feedbackCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Feedback Tickets</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedUserData.contactCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Contact Messages</div>
                </div>
              </div>

              {/* Posts */}
              {selectedUserData.communityPosts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">📱 Community Posts ({selectedUserData.postCount})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedUserData.communityPosts.map((post: any) => (
                      <div key={post.id} className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-800">{post.caption.substring(0, 80)}...</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedUserData.feedbackTickets.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">⚠️ Feedback Tickets ({selectedUserData.feedbackCount})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedUserData.feedbackTickets.map((ticket: any) => (
                      <div key={ticket.id} className="bg-orange-50 p-3 rounded text-sm">
                        <p className="text-gray-800 font-semibold">{ticket.subject}</p>
                        <Badge tone={ticket.status === "Resolved" ? "green" : "amber"} className="mt-1">
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Messages */}
              {selectedUserData.contactMessages.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">💬 Contact Messages ({selectedUserData.contactCount})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedUserData.contactMessages.map((msg: any, idx: number) => (
                      <div key={idx} className="bg-green-50 p-3 rounded text-sm">
                        <p className="text-gray-800 font-semibold">{msg.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Contact Submissions */}
        <Card className="p-8 shadow-lg mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink-900">📧 Contact Submissions</h2>
            <p className="mt-1 text-sm text-gray-600">All messages received from contact form</p>
          </div>
          {contactSubmissions.length === 0 ? (
            <p className="text-gray-600 text-sm">No contact submissions yet</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {contactSubmissions.map((submission: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{submission.name}</h3>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2"><strong>Subject:</strong> {submission.subject}</p>
                  <p className="text-sm text-gray-700">{submission.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Feedback Tickets */}
        <Card className="p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink-900">⚠️ Feedback & Complaints</h2>
            <p className="mt-1 text-sm text-gray-600">All user feedback and complaint tickets</p>
          </div>
          {feedbackTickets.length === 0 ? (
            <p className="text-gray-600 text-sm">No feedback tickets yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-chai-100">
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Category</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Subject</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Contact</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackTickets.map((ticket, idx) => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ animation: `slideInUp 0.5s ease-out ${idx * 0.05}s both` }}>
                      <td className="py-3 px-4 text-gray-700">{ticket.category}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{ticket.subject}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="text-sm">{ticket.contactName}</div>
                        <div className="text-xs text-gray-600">{ticket.contactEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={ticket.status === "Resolved" ? "green" : ticket.status === "In Review" ? "amber" : "rose"}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
