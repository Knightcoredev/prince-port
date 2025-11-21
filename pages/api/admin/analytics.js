import { readBlogPosts } from '../../../lib/blog';
import { readProjects } from '../../../lib/db';
import { readContacts } from '../../../lib/db';
import { requireAuth } from '../../../lib/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { range = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    // Get blog posts
    const blogPosts = await readBlogPosts();
    const publishedPosts = blogPosts.filter(post => post.status === 'published');
    
    // Get projects
    const projects = await readProjects();
    
    // Get contact submissions
    const contacts = await readContacts();
    const recentContacts = contacts.filter(contact => {
      const contactDate = new Date(contact.submittedAt);
      return contactDate >= startDate;
    });

    // Calculate analytics
    const analytics = {
      totalBlogPosts: publishedPosts.length,
      totalProjects: projects.length,
      totalContacts: contacts.length,
      recentContacts: recentContacts.length,
      unreadContacts: contacts.filter(c => c.status === 'unread').length,
      
      // Recent activity (based on selected range)
      recentActivity: [
        ...publishedPosts
          .filter(post => {
            const postDate = new Date(post.createdAt);
            return postDate >= startDate;
          })
          .map(post => ({
            type: 'blog_post',
            title: `Published "${post.title}"`,
            date: post.createdAt,
            link: `/blog/${post.slug}`
          })),
        ...projects
          .filter(project => {
            const projectDate = new Date(project.createdAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return projectDate >= sevenDaysAgo;
          })
          .map(project => ({
            type: 'project',
            title: `Added project "${project.title}"`,
            date: project.createdAt,
            link: `/admin/projects/edit/${project.id}`
          })),
        ...recentContacts
          .map(contact => ({
            type: 'contact',
            title: `New message from ${contact.name}`,
            date: contact.submittedAt,
            link: `/admin/contact/${contact.id}`
          }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),

      // Popular blog posts (by reading time - simulated metric)
      popularPosts: publishedPosts
        .sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0))
        .slice(0, 5)
        .map(post => ({
          title: post.title,
          slug: post.slug,
          views: Math.floor(Math.random() * 1000) + 100, // Simulated views
          readingTime: post.readingTime
        })),

      // Monthly stats based on range
      monthlyStats: generateMonthlyStats(publishedPosts, contacts, range)
    };

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data' 
    });
  }
}

function generateMonthlyStats(blogPosts, contacts, range = '30d') {
  const stats = [];
  const now = new Date();
  
  // Determine number of periods based on range
  let periods = 6;
  let periodType = 'month';
  
  if (range === '7d') {
    periods = 7;
    periodType = 'day';
  } else if (range === '30d') {
    periods = 30;
    periodType = 'day';
  } else if (range === '90d') {
    periods = 12;
    periodType = 'week';
  }
  
  if (periodType === 'day') {
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayBlogPosts = blogPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= date && postDate < nextDay;
      });
      
      const dayContacts = contacts.filter(contact => {
        const contactDate = new Date(contact.submittedAt);
        return contactDate >= date && contactDate < nextDay;
      });
      
      stats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        blogPosts: dayBlogPosts.length,
        contacts: dayContacts.length,
        views: Math.floor(Math.random() * 500) + 100
      });
    }
  } else if (periodType === 'week') {
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7));
      const nextWeek = new Date(date);
      nextWeek.setDate(date.getDate() + 7);
      
      const weekBlogPosts = blogPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= date && postDate < nextWeek;
      });
      
      const weekContacts = contacts.filter(contact => {
        const contactDate = new Date(contact.submittedAt);
        return contactDate >= date && contactDate < nextWeek;
      });
      
      stats.push({
        month: `Week ${Math.ceil((now - date) / (7 * 24 * 60 * 60 * 1000))}`,
        blogPosts: weekBlogPosts.length,
        contacts: weekContacts.length,
        views: Math.floor(Math.random() * 2000) + 500
      });
    }
  } else {
    // Monthly stats
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthBlogPosts = blogPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= date && postDate < nextMonth;
    });
    
    const monthContacts = contacts.filter(contact => {
      const contactDate = new Date(contact.submittedAt);
      return contactDate >= date && contactDate < nextMonth;
    });
      
      stats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        blogPosts: monthBlogPosts.length,
        contacts: monthContacts.length,
        views: Math.floor(Math.random() * 5000) + 1000
      });
    }
  }
  
  return stats;
}

export default requireAuth(handler);