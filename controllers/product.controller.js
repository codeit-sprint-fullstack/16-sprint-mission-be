//import { items } from '../data/testdata.js';
import Product from '../models/product.model.js';
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
        const product = await Product.create({
            images,
            name,
            description,
            price,
            tags
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
        const product = await Product.findById(req.params.id);

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
        const productList = await Product.find();

        let { page, pageSize, orderBy, keyword } = req.query;

        page = Number(page) || 1;
        pageSize = Number(pageSize) || 10;

        if (orderBy !== "favorite" && orderBy !== "recent") {
            orderBy = "recent";
        }

        
        let filteredList = productList;

        if (keyword) {
            filteredList = productList.filter((product) =>
                product.name.includes(keyword) ||
                product.description.includes(keyword)
            );
        }

        // 정렬
        if (orderBy === "favorite") {
            filteredList.sort(
                (a, b) => b.favoriteCount - a.favoriteCount
            );
        }
        else if (orderBy === "recent") {
            filteredList.sort(
                (a, b) => b.createdAt - a.createdAt
            );
        }

        // 검색 결과 전체 개수
        const totalCount = await Product.countDocuments();

        // 페이지네이션
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const result = filteredList.slice(start, end);

        return res.json({
            list: result,
            totalCount: totalCount
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
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }

        );

        if (!product) {
            return res.status(404).json({
                message: "존재하지 않는 상품입비나."
            });
        }

        return res.json(product);
    } catch (error) {
        console.log("editProduct 에러 :", error);
        return res.status(500).json({
            message : "상품 수정 실패"
        })
    }
    
}
//상품 삭제
export const removeProduct = async(req, res) => {
     try {
        const product = await Product.findByIdAndDelete(req.params.id);

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
