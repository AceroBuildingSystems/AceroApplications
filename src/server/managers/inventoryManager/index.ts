import { Product, ProductCategory, Transaction, Vendor, Warehouse } from "@/models";
import { createMongooseObjectId } from "@/shared/functions";
import { ERROR, INVALID_REQUEST, SUCCESS } from "@/shared/constants";
import mongoose from "mongoose";

class InventoryManager {
    // Get Methods
    async getProducts(operations: any) {
        try {
            const products = await Product.find(operations.filter)
                .sort(operations.sort || {})
                .populate(operations.populate || []);
            return { status: SUCCESS, message: SUCCESS, data: products };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async getProductCategories(operations: any) {
        try {
            const categories = await ProductCategory.find(operations.filter)
                .sort(operations.sort || {})
                .populate(operations.populate || []);
            return { status: SUCCESS, message: SUCCESS, data: categories };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async getWarehouses(operations: any) {
        try {
            const warehouses = await Warehouse.find(operations.filter)
                .sort(operations.sort || {})
                .populate(operations.populate || []);
            return { status: SUCCESS, message: SUCCESS, data: warehouses };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async getTransactions(operations: any) {
        try {
            const transactions = await Transaction.find(operations.filter)
                .sort(operations.sort || {})
                .populate(operations.populate || []);
            return { status: SUCCESS, message: SUCCESS, data: transactions };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async getVendors(operations: any) {
        try {
            const vendors = await Vendor.find(operations.filter)
                .sort(operations.sort || {})
                .populate(operations.populate || []);
            return { status: SUCCESS, message: SUCCESS, data: vendors };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Product Category Operations
    async createProductCategory(data: any) {
        try {
            const category = await ProductCategory.create(data);
            return { status: SUCCESS, message: SUCCESS, data: category };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async updateProductCategory(id: string, data: any) {
        try {
            const category = await ProductCategory.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            return { status: SUCCESS, message: SUCCESS, data: category };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Product Operations
    async createProduct(data: any) {
        try {
            // Validate category exists
            const category = await ProductCategory.findById(data.category);
            if (!category) {
                return { status: ERROR, message: "Product category not found" };
            }

            const product = await Product.create({
                ...data,
                specifications: {
                    templateVersion: category.specificationTemplate.version,
                    values: data.specifications.values
                }
            });

            return { status: SUCCESS, message: SUCCESS, data: product };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async updateProduct(id: string, data: any) {
        try {
            // If updating specifications, validate against category template
            if (data.specifications?.values) {
                const product = await Product.findById(id).populate('category');
                if (!product) {
                    return { status: ERROR, message: "Product not found" };
                }

                const category = product.category as any;
                if (data.specifications.templateVersion !== category.specificationTemplate.version) {
                    return { status: ERROR, message: "Template version mismatch" };
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            return { status: SUCCESS, message: SUCCESS, data: updatedProduct };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Warehouse Operations
    async createWarehouse(data: any) {
        try {
            const warehouse = await Warehouse.create(data);
            return { status: SUCCESS, message: SUCCESS, data: warehouse };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async updateWarehouse(id: string, data: any) {
        try {
            const warehouse = await Warehouse.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            return { status: SUCCESS, message: SUCCESS, data: warehouse };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Vendor Operations
    async createVendor(data: any) {
        try {
            const vendor = await Vendor.create(data);
            return { status: SUCCESS, message: SUCCESS, data: vendor };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    async updateVendor(id: string, data: any) {
        try {
            const vendor = await Vendor.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            return { status: SUCCESS, message: SUCCESS, data: vendor };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Transaction Operations
    async createTransaction(data: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create the transaction
            const transaction = await Transaction.create([data], { session });

            // Update inventory/asset based on transaction type
            switch (data.type) {
                case 'STOCK_RECEIPT':
                    await this.handleStockReceipt(transaction[0], session);
                    break;
                case 'STOCK_TRANSFER':
                    await this.handleStockTransfer(transaction[0], session);
                    break;
                case 'ASSET_ASSIGNMENT':
                    await this.handleAssetAssignment(transaction[0], session);
                    break;
                // Add other transaction type handlers
            }

            await session.commitTransaction();
            return { status: SUCCESS, message: SUCCESS, data: transaction[0] };
        } catch (error: any) {
            await session.abortTransaction();
            return { status: ERROR, message: error.message };
        } finally {
            session.endSession();
        }
    }

    async updateTransaction(id: string, data: any) {
        try {
            const transaction = await Transaction.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }
            );
            return { status: SUCCESS, message: SUCCESS, data: transaction };
        } catch (error: any) {
            return { status: ERROR, message: error.message };
        }
    }

    // Transaction Type Handlers
    private async handleStockReceipt(transaction: any, session: any) {
        const product = await Product.findById(transaction.product);
        if (!product || !product.inventory) {
            throw new Error('Invalid product for stock receipt');
        }

        // Update warehouse quantity
        const warehouseIndex = product.inventory.warehouses.findIndex(
            (w: any) => w.warehouse.toString() === transaction.destination.warehouse.toString()
        );

        if (warehouseIndex === -1) {
            // Add new warehouse entry
            product.inventory.warehouses.push({
                warehouse: transaction.destination.warehouse,
                quantity: transaction.quantity,
                location: transaction.destination.location
            });
        } else {
            // Update existing warehouse quantity
            product.inventory.warehouses[warehouseIndex].quantity += transaction.quantity;
        }

        await product.save({ session });
    }

    private async handleStockTransfer(transaction: any, session: any) {
        const product = await Product.findById(transaction.product);
        if (!product || !product.inventory) {
            throw new Error('Invalid product for stock transfer');
        }

        // Deduct from source warehouse
        const sourceIndex = product.inventory.warehouses.findIndex(
            (w: any) => w.warehouse.toString() === transaction.source.warehouse.toString()
        );
        if (sourceIndex === -1 || product.inventory.warehouses[sourceIndex].quantity < transaction.quantity) {
            throw new Error('Insufficient stock in source warehouse');
        }
        product.inventory.warehouses[sourceIndex].quantity -= transaction.quantity;

        // Add to destination warehouse
        const destIndex = product.inventory.warehouses.findIndex(
            (w: any) => w.warehouse.toString() === transaction.destination.warehouse.toString()
        );
        if (destIndex === -1) {
            product.inventory.warehouses.push({
                warehouse: transaction.destination.warehouse,
                quantity: transaction.quantity,
                location: transaction.destination.location
            });
        } else {
            product.inventory.warehouses[destIndex].quantity += transaction.quantity;
        }

        await product.save({ session });
    }

    private async handleAssetAssignment(transaction: any, session: any) {
        const product = await Product.findById(transaction.product);
        if (!product) {
            throw new Error('Invalid product for asset assignment');
        }

        // Update asset assignment status
        // This would depend on your specific requirements for asset tracking
        // For example, you might maintain an assignments array in the product document

        await product.save({ session });
    }
}

export const inventoryManager = new InventoryManager();