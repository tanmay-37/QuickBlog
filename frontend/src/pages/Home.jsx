import BlogForm from '../components/blog form/BlogForm'

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Blog Post</h1>
      <BlogForm />
    </div>
  )
}

export default Home