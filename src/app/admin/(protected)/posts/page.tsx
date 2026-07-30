import { Icon } from "@/components/Icon";
import { articles } from "@/data/portfolio";

export default function AdminPostsPage() {
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Publishing</span><h1>Posts</h1><p>Manage articles, learning notes and career updates.</p></div><button className="button button-primary"><Icon name="plus" size={17}/> New post</button></div>
      <div className="admin-grid-two posts-layout">
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Draft library</span><h2>Planned articles</h2></div></div><div className="content-table">{articles.map((article) => <div className="content-row post-row" key={article.slug}><span className="table-thumb"><Icon name="file" size={18}/></span><div><strong>{article.title}</strong><small>{article.category} · {article.readTime}</small></div><span className="status status-draft">Draft</span><button><Icon name="edit" size={17}/></button></div>)}</div></section>
        <section className="admin-panel editor-preview"><div className="panel-head"><div><span className="eyebrow">Editor preview</span><h2>Create a new post</h2></div></div><label>Post title<input placeholder="Enter an article title" /></label><div className="form-row"><label>Category<select defaultValue=""><option value="" disabled>Select category</option><option>Data Analytics</option><option>Artificial Intelligence</option><option>SaaS Development</option><option>Career Journey</option></select></label><label>Status<select defaultValue="draft"><option value="draft">Draft</option><option>Published</option></select></label></div><label>Excerpt<textarea rows={3} placeholder="Write a short summary..." /></label><label>Content<div className="fake-editor"><div><b>B</b><i>I</i><span>H1</span><span>H2</span><span>• List</span><span>Link</span></div><p>Start writing your article here...</p></div></label><div className="form-actions"><button className="button button-secondary">Save draft</button><button className="button button-primary">Publish</button></div></section>
      </div>
    </>
  );
}
