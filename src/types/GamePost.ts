export interface GamePost {
    post_id: number
    title: string
    contents: string
    post_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' | 'TALK' | 'NOTICE'
    author_id: number
    app_id: number
    created_date: Date
    updated_date: Date
}