import { inventoryManager } from '@/server/managers/inventoryManager';
import { BODY_REQUIRED, ERROR, INSUFFIENT_DATA, INVALID_REQUEST, SUCCESS } from '@/shared/constants';
import { createMongooseObjectId } from '@/shared/functions';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = new URL(request.url).searchParams;
    const model = searchParams.get('model');
    const operations: any = {};

    // Extract and parse the filter parameter
    const filterParam = searchParams.get('filter');
    if (filterParam) {
        try {
            operations.filter = JSON.parse(filterParam);
        } catch (error) {
            return NextResponse.json(
                { status: ERROR, message: 'INVALID_FILTER_FORMAT', data: {} },
                { status: 400 }
            );
        }
    } else {
        operations.filter = {};
    }

    // Extract and parse the sort parameter
    const sortParam = searchParams.get('sort');
    if (sortParam) {
        try {
            operations.sort = JSON.parse(sortParam);
        } catch (error) {
            return NextResponse.json(
                { status: ERROR, message: 'INVALID_SORT_FORMAT', data: {} },
                { status: 400 }
            );
        }
    }

    // Populate Parameter
    const populateParam = searchParams.get('populate');
    if (populateParam) {
        try {
            operations.populate = JSON.parse(populateParam);
        } catch (error) {
            return NextResponse.json(
                { status: ERROR, message: 'INVALID_POPULATE_FORMAT', data: {} },
                { status: 400 }
            );
        }
    }

    // Handle different model types
    let response: any;
    switch (model) {
        case 'product':
            response = await inventoryManager.getProducts(operations);
            break;
        case 'category':
            response = await inventoryManager.getProductCategories(operations);
            break;
        case 'warehouse':
            response = await inventoryManager.getWarehouses(operations);
            break;
        case 'transaction':
            response = await inventoryManager.getTransactions(operations);
            break;
        case 'vendor':
            response = await inventoryManager.getVendors(operations);
            break;
        default:
            return NextResponse.json(
                { status: ERROR, message: 'INVALID_MODEL', data: {} },
                { status: 400 }
            );
    }

    if (response.status === SUCCESS) {
        return NextResponse.json(
            { status: SUCCESS, message: SUCCESS, data: response.data },
            { status: 200 }
        );
    }

    return NextResponse.json(
        { status: ERROR, message: response.message, data: {} },
        { status: 500 }
    );
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (!body) {
        return NextResponse.json(
            { status: ERROR, message: BODY_REQUIRED, data: {} },
            { status: 400 }
        );
    }

    const { model, action, data } = body;

    if (!model || !action || !data) {
        return NextResponse.json(
            { status: ERROR, message: INSUFFIENT_DATA, data: {} },
            { status: 400 }
        );
    }

    // Add audit fields
    if (body.addedBy) {
        body.data.addedBy = createMongooseObjectId(body.addedBy);
    }
    if (body.updatedBy) {
        body.data.updatedBy = createMongooseObjectId(body.updatedBy);
    }

    let response: any;

    switch (model) {
        case 'product':
            response = action === 'create' 
                ? await inventoryManager.createProduct(data)
                : await inventoryManager.updateProduct(data._id, data);
            break;
        case 'category':
            response = action === 'create'
                ? await inventoryManager.createProductCategory(data)
                : await inventoryManager.updateProductCategory(data._id, data);
            break;
        case 'warehouse':
            response = action === 'create'
                ? await inventoryManager.createWarehouse(data)
                : await inventoryManager.updateWarehouse(data._id, data);
            break;
        case 'transaction':
            response = action === 'create'
                ? await inventoryManager.createTransaction(data)
                : await inventoryManager.updateTransaction(data._id, data);
            break;
        case 'vendor':
            response = action === 'create'
                ? await inventoryManager.createVendor(data)
                : await inventoryManager.updateVendor(data._id, data);
            break;
        default:
            return NextResponse.json(
                { status: ERROR, message: INVALID_REQUEST, data: {} },
                { status: 400 }
            );
    }

    if (response.status === SUCCESS) {
        return NextResponse.json(
            { status: SUCCESS, message: SUCCESS, data: response.data },
            { status: 200 }
        );
    }

    return NextResponse.json(
        { status: ERROR, message: response.message, data: {} },
        { status: 500 }
    );
}