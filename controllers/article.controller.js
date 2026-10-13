//import { items } from '../data/testdata.js';
import { prisma } from '../db.js';
//게시글 등록
export const createArticle = async (req, res) => {
    try {
        console.log('payload : ', req.body);

        const { title, content} = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "제목이랑 내용은 필수로 입력해주십시오"
            });
        }
        const article = await prisma.article.create({
            data: {
                title,
                content
            }
        });

        res.status(201).json(article);
    } catch (error) {
        console.log("createAritcle 에러 :", error);

        res.status(500).json({
            message: "게시글 등록 실패"
        })
    }

};
//1개 조회
export const loadOneArticle = async (req, res) => {
    try {
        const article = await prisma.article.findUnique({
            where : {
                id : Number(req.params.id)
            }
        });

        console.log("게시글 아이디 ", req.params.id);

        if (!article) {
            res.status(404).json({
                message: "존재하지 않는 게시글입니다."
            })
            return;
        };
        return res.json(article);
    } catch (error) {
        console.log("loadOneArticle 에러 :", error);
        return res.status(500).json({
            message: "게시글을 조회하는데 실패했습니다."
        });
    }

};
// 여러 개 조회
export const loadArticleList = async (req, res) => {
    try {
        let { page, pageSize, orderBy, keyword } = req.query;

        page = Number(page) || 1;
        pageSize = Number(pageSize) || 10;

        const where = keyword
            ? {
                  OR: [
                      {
                          title: {
                              contains: keyword
                          }
                      },
                      {
                          content: {
                              contains: keyword
                          }
                      }
                  ]
              }
            : {};

        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: "desc" },
                
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        const totalCount = await prisma.article.count({
            where
        });

        return res.json({
            list: articles,
            totalCount
        });

    } catch (error) {
        console.error("loadArticleList 에러 :", error);

        return res.status(500).json({
            message: "게시글 목록을 불러오는데 실패했습니다."
        });
    }
};
//게시글 수정
export const editArticle = async (req, res) => {
    try {
        const article = await prisma.article.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        return res.json(article);

    } catch (error) {
        console.log("editArticle 에러 :", error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "존재하지 않는 게시글입니다."
            });
        }

        return res.status(500).json({
            message: "게시글 수정 실패"
        });
    }
};
//게시글 삭제
export const removeArticle = async (req, res) => {
    try {
        const article = await prisma.article.delete({
            where: {
                id : Number(req.params.id)
            }
        })

        console.log("상품 아이디 ", req.params.id);

        if (!article) {
            res.status(404).json({
                message: "존재하지 않는 상품입니다."
            })
            return;
        };
        return res.json(article);
    } catch (error) {
        console.log("removeArticle 에러 :", error);
        return res.status(500).json({
            message: "게시글을 삭제하는데 실패했습니다."
        });
    }

}
