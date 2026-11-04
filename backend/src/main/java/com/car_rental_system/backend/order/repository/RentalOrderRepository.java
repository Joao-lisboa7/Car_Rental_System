package com.car_rental_system.backend.order.repository;

import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.model.RentalOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalOrderRepository extends JpaRepository<RentalOrder, Long> {

    List<RentalOrder> findByClientOrderByCreatedAtDesc(ClientUser client);

    List<RentalOrder> findAllByOrderByCreatedAtDesc();

    List<RentalOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @Query("SELECT r FROM RentalOrder r WHERE r.status IN :statuses ORDER BY r.createdAt DESC")
    List<RentalOrder> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);
}
