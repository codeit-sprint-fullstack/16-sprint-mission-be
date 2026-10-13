//import { items } from '../data/testdata.js';
import { prisma } from '../db.js';
//상품 등록
export const createProduct = async (req, res) => {
    try {
        console.log('payload : ', req.body);

        const { images, tags, price, description, name } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: "이름이랑 가격은 필수로 입력해주십시오"
            });
        }
        const product = await prisma.product.create({
            data: {
                images,
                name,
                description,
                price,
                tags
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("createProduct 에러 :", error);

        res.status(500).json({
            message: "상품 등록 실패"
        })
    }

};
//1개 조회
export const loadOneProduct = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where : {
                id : Number(req.params.id)
            }
        });

        console.log("상품 아이디 ", req.params.id);

        if (!product) {
            res.status(404).json({
                message: "존재하지 않는 상품입니다."
            })
            return;
        };
        return res.json(product);
    } catch (error) {
        console.log("loadOneProduct 에러 :", error);
        return res.status(500).json({
            message: "상품을 조회하는데 실패했습니다."
        });
    }

};
// 여러 개 조회
export const loadProductList = async (req, res) => {
    try {
        let { page, pageSize, orderBy, keyword } = req.query;

        page = Number(page) || 1;
        pageSize = Number(pageSize) || 10;

        if (orderBy !== "favorite" && orderBy !== "recent") {
            orderBy = "recent";
        }

        const where = keyword
            ? {
                  OR: [
                      {
                          name: {
                              contains: keyword
                          }
                      },
                      {
                          description: {
                              contains: keyword
                          }
                      }
                  ]
              }
            : {};

        const products = await prisma.product.findMany({
            where,
            orderBy:
                orderBy === "favorite"
                    ? { favoriteCount: "desc" }
                    : { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        const totalCount = await prisma.product.count({
            where
        });

        return res.json({
            list: products,
            totalCount
        });

    } catch (error) {
        console.error("loadProductList 에러 :", error);

        return res.status(500).json({
            message: "상품 목록을 불러오는데 실패했습니다."
        });
    }
};
//상품 수정
export const editProduct = async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        return res.json(product);

    } catch (error) {
        console.log("editProduct 에러 :", error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "존재하지 않는 상품입니다."
            });
        }

        return res.status(500).json({
            message: "상품 수정 실패"
        });
    }
};
//상품 삭제
export const removeProduct = async (req, res) => {
    try {
        const product = await prisma.product.delete({
            where: {
                id : Number(req.params.id)
            }
        })

        console.log("상품 아이디 ", req.params.id);

        if (!product) {
            res.status(404).json({
                message: "존재하지 않는 상품입니다."
            })
            return;
        };
        return res.json(product);
    } catch (error) {
        console.log("removeProduct 에러 :", error);
        return res.status(500).json({
            message: "상품을 삭제하는데 실패했습니다."
        });
    }

}
