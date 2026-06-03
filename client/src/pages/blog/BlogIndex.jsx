import { Link } from 'react-router-dom';

const posts = [
  {
    slug: 'best-booking-software-nz',
    title: 'Best Booking Software for Salons in New Zealand (2026)',
    excerpt: 'Compare Timely, Fresha, Booksy, and Timia. Find the best free booking software for your NZ salon.',
    date: 'June 2026',
    readTime: '8 min',
  },
  {
    slug: 'how-to-reduce-no-shows',
    title: 'How to Reduce No-Shows at Your Salon (Proven Strategies)',
    excerpt: 'No-shows cost NZ salons $3,000-$8,000/year. Learn 7 proven strategies to reduce them by 50%.',
    date: 'June 2026',
    readTime: '6 min',
  },
  {
    slug: 'start-salon-business-nz',
    title: 'How to Start a Salon Business in New Zealand (2026 Guide)',
    excerpt: 'Complete guide to starting a salon in NZ — from registration to your first client. Costs, tips, and tools.',
    date: 'June 2026',
    readTime: '10 min',
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-pink-600">Timia</Link>
          <Link to="/register" className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">Get Started Free</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Timia Blog</h1>
        <p className="text-gray-500 mb-10">Tips, guides, and insights for salon owners in New Zealand.</p>

        <div className="space-y-8">
          {posts.map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
              <article className="border border-gray-200 rounded-xl p-6 hover:border-pink-300 hover:shadow-md transition">
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-3">{post.excerpt}</p>
                <span className="text-sm text-gray-400">{post.date} · {post.readTime} read</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
