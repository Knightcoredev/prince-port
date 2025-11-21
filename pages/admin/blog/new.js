import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import BlogEditor from '../../../components/blog/BlogEditor';

export default function NewBlogPost() {
  const router = useRouter();

  const handleSave = (post) => {
    // Redirect to edit page after successful creation
    router.push(`/admin/blog/edit/${post.id}`);
  };

  const handleCancel = () => {
    router.push('/admin/blog');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
        </div>
        
        <BlogEditor 
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
}